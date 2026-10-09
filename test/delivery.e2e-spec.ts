import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';

interface CreateTransactionResponse {
  transactionId: string;
  reference: string;
  checkoutUrl: string;
}

interface DeliveryResponse {
  id: string;
  transactionId: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
}

const EVENTS_SECRET = 'events_test_xxx';

const validCustomer = {
  email: 'cliente@example.com',
  fullName: 'Juan Pérez',
  phoneNumber: '3001234567',
  phoneNumberPrefix: '+57',
};

const validShippingAddress = {
  addressLine1: 'Calle 123 #45-67',
  country: 'CO',
  city: 'Bogotá',
  phoneNumber: '3001234567',
  region: 'Cundinamarca',
};

describe('Deliveries (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let productId: string;
  let transactionId: string;
  let deliveryId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.delivery.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();

    const product = await prisma.product.create({
      data: {
        title: 'Test Product',
        description: 'Test Description',
        price: 95.0,
        image: 'test.jpg',
        stock: 10,
      },
    });
    productId = product.id;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await prisma.delivery.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('auto-creates delivery on APPROVED webhook', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/transactions')
      .send({
        productId,
        quantity: 1,
        productPrice: 95.0,
        customer: validCustomer,
        shippingAddress: validShippingAddress,
      })
      .expect(201);

    const created = createResponse.body as CreateTransactionResponse;
    transactionId = created.transactionId;

    const payload = JSON.stringify({
      event: {
        type: 'transaction.updated',
        transaction: {
          id: 'wompi-tx-delivery-001',
          status: 'APPROVED',
          reference: created.reference,
        },
      },
    });

    const signature = createHmac('sha256', EVENTS_SECRET)
      .update(Buffer.from(payload))
      .digest('hex');

    await request(app.getHttpServer())
      .post('/api/webhooks/wompi')
      .set('Content-Type', 'application/json')
      .set('x-event-signature', signature)
      .send(payload)
      .expect(200);

    const deliveryResponse = await request(app.getHttpServer())
      .get('/api/deliveries')
      .query({ transactionId })
      .expect(200);

    const delivery = deliveryResponse.body as DeliveryResponse;
    expect(delivery.transactionId).toBe(transactionId);
    expect(delivery.status).toBe('PENDING');
    expect(delivery.carrier).toBeNull();
    expect(delivery.trackingNumber).toBeNull();
    deliveryId = delivery.id;
  });

  it('GET /api/deliveries/:id → 200 with delivery details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/deliveries/${deliveryId}`)
      .expect(200);

    const body = response.body as DeliveryResponse;
    expect(body.id).toBe(deliveryId);
    expect(body.status).toBe('PENDING');
  });

  it('GET /api/deliveries/:id → 404 when delivery does not exist', async () => {
    await request(app.getHttpServer())
      .get('/api/deliveries/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('PATCH /api/deliveries/:id/status → 200 on valid transition PENDING → IN_TRANSIT', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/deliveries/${deliveryId}/status`)
      .send({ status: 'IN_TRANSIT', carrier: 'DHL', trackingNumber: 'TRACK123' })
      .expect(200);

    const body = response.body as DeliveryResponse;
    expect(body.status).toBe('IN_TRANSIT');
    expect(body.carrier).toBe('DHL');
    expect(body.trackingNumber).toBe('TRACK123');
  });

  it('PATCH /api/deliveries/:id/status → 200 on valid transition IN_TRANSIT → DELIVERED', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/deliveries/${deliveryId}/status`)
      .send({ status: 'DELIVERED' })
      .expect(200);

    expect((response.body as DeliveryResponse).status).toBe('DELIVERED');
  });

  it('PATCH /api/deliveries/:id/status → 400 on invalid transition DELIVERED → IN_TRANSIT', async () => {
    await request(app.getHttpServer())
      .patch(`/api/deliveries/${deliveryId}/status`)
      .send({ status: 'IN_TRANSIT' })
      .expect(400);
  });

  it('PATCH /api/deliveries/:id/status → 404 when delivery does not exist', async () => {
    await request(app.getHttpServer())
      .patch('/api/deliveries/00000000-0000-0000-0000-000000000000/status')
      .send({ status: 'IN_TRANSIT' })
      .expect(404);
  });
});
