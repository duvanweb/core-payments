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

interface TransactionResponse {
  id: string;
  status: string;
  reference: string;
  productId: string;
  quantity: number;
  totalAmountInCents: number;
  currency: string;
  wompiTransactionId: string | null;
  customerId: string | null;
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

describe('Transactions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let productId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
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
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/transactions', () => {
    it('→ 201 with transactionId, reference, and checkoutUrl', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          productId,
          quantity: 1,
          productPrice: 95.0,
          customer: validCustomer,
          shippingAddress: validShippingAddress,
        })
        .expect(201);

      const body = response.body as CreateTransactionResponse;
      expect(body.transactionId).toBeDefined();
      expect(body.reference).toBeDefined();
      expect(body.checkoutUrl).toContain('checkout.wompi.co');
    });

    it('→ 404 when product does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          productId: '00000000-0000-0000-0000-000000000000',
          quantity: 1,
          productPrice: 95.0,
          customer: validCustomer,
          shippingAddress: validShippingAddress,
        })
        .expect(404);
    });

    it('→ 409 when price does not match', async () => {
      await request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          productId,
          quantity: 1,
          productPrice: 99.99,
          customer: validCustomer,
          shippingAddress: validShippingAddress,
        })
        .expect(409);
    });

    it('→ 409 when insufficient stock', async () => {
      await request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          productId,
          quantity: 100,
          productPrice: 95.0,
          customer: validCustomer,
          shippingAddress: validShippingAddress,
        })
        .expect(409);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('→ 200 with transaction details', async () => {
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

      const { transactionId } = createResponse.body as CreateTransactionResponse;

      const response = await request(app.getHttpServer())
        .get(`/api/transactions/${transactionId}`)
        .expect(200);

      const body = response.body as TransactionResponse;
      expect(body.id).toBe(transactionId);
      expect(body.status).toBe('PENDING');
      expect(body.productId).toBe(productId);
    });

    it('→ 404 when transaction does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/transactions/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /api/webhooks/wompi', () => {
    it('→ 200 with valid signature, updates transaction and decrements stock', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          productId,
          quantity: 2,
          productPrice: 95.0,
          customer: validCustomer,
          shippingAddress: validShippingAddress,
        })
        .expect(201);

      const { transactionId, reference } = createResponse.body as CreateTransactionResponse;

      const stockBefore = await prisma.product.findUnique({ where: { id: productId } });
      expect(stockBefore).not.toBeNull();

      const payload = JSON.stringify({
        event: {
          type: 'transaction.updated',
          transaction: {
            id: 'wompi-tx-test-001',
            status: 'APPROVED',
            reference,
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

      const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
      expect(tx).not.toBeNull();
      expect(tx!.status).toBe('APPROVED');
      expect(tx!.wompiTransactionId).toBe('wompi-tx-test-001');
      expect(tx!.customerId).not.toBeNull();

      const stockAfter = await prisma.product.findUnique({ where: { id: productId } });
      expect(stockAfter!.stock).toBe(stockBefore!.stock - 2);

      const customer = await prisma.customer.findUnique({ where: { id: tx!.customerId! } });
      expect(customer).not.toBeNull();
      expect(customer!.email).toBe(validCustomer.email);
    });

    it('→ 401 with invalid signature', async () => {
      const payload = JSON.stringify({
        event: {
          type: 'transaction.updated',
          transaction: { id: 'x', status: 'APPROVED', reference: 'x' },
        },
      });

      await request(app.getHttpServer())
        .post('/api/webhooks/wompi')
        .set('Content-Type', 'application/json')
        .set('x-event-signature', 'invalid-signature')
        .send(payload)
        .expect(401);
    });
  });
});
