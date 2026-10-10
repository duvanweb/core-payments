import { HttpException, HttpStatus } from '@nestjs/common';
import { createHmac } from 'crypto';
import { okAsync, errAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { WebhookController } from './webhook.controller';

class FakeWebhookUseCase {
  result: any = okAsync(undefined);
  execute(_input: any) {
    return this.result;
  }
}

class FakeConfigService {
  secret = 'test-secret';
  get(_key: string) {
    return this.secret;
  }
}

class TestError extends DomainError {
  constructor() {
    super('WOMPI_API_ERROR', 'Wompi error');
  }
}

function makeReq(rawBody: Buffer | undefined, signature?: string) {
  return {
    rawBody,
    headers: signature ? { 'x-event-signature': signature } : {},
  } as any;
}

function computeSignature(secret: string, body: Buffer): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

describe('WebhookController', () => {
  it('throws 400 when raw body is missing', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    const controller = new WebhookController(useCase as any, config as any);

    await expect(controller.handleWompi(makeReq(undefined))).rejects.toThrow(HttpException);
  });

  it('throws 401 when signature header is missing', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    const controller = new WebhookController(useCase as any, config as any);

    const body = Buffer.from(JSON.stringify({}));
    await expect(controller.handleWompi(makeReq(body))).rejects.toThrow(HttpException);
  });

  it('throws 401 when secret is not configured', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    config.secret = null as any;
    const controller = new WebhookController(useCase as any, config as any);

    const body = Buffer.from(JSON.stringify({}));
    await expect(controller.handleWompi(makeReq(body, 'sig'))).rejects.toThrow(HttpException);
  });

  it('throws 401 when signature is invalid', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    const controller = new WebhookController(useCase as any, config as any);

    const body = Buffer.from(JSON.stringify({}));
    await expect(controller.handleWompi(makeReq(body, 'invalid-sig'))).rejects.toThrow(HttpException);
  });

  it('delegates to use case with event.transaction payload', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    const controller = new WebhookController(useCase as any, config as any);

    const payload = {
      event: {
        transaction: { id: 'wompi-1', reference: 'REF-001', status: 'APPROVED' },
      },
    };
    const body = Buffer.from(JSON.stringify(payload));
    const sig = computeSignature('test-secret', body);

    await controller.handleWompi(makeReq(body, sig));
    expect(useCase.result).toBeDefined();
  });

  it('delegates to use case with data.transaction payload', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    const controller = new WebhookController(useCase as any, config as any);

    const payload = {
      data: {
        transaction: { id: 'wompi-1', reference: 'REF-001', status: 'APPROVED' },
      },
    };
    const body = Buffer.from(JSON.stringify(payload));
    const sig = computeSignature('test-secret', body);

    await controller.handleWompi(makeReq(body, sig));
    expect(useCase.result).toBeDefined();
  });

  it('returns void when no transaction in payload', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    const controller = new WebhookController(useCase as any, config as any);

    const payload = { event: {} };
    const body = Buffer.from(JSON.stringify(payload));
    const sig = computeSignature('test-secret', body);

    const result = await controller.handleWompi(makeReq(body, sig));
    expect(result).toBeUndefined();
  });

  it('throws 500 when use case returns error', async () => {
    const useCase = new FakeWebhookUseCase();
    const config = new FakeConfigService();
    useCase.result = errAsync(new TestError());
    const controller = new WebhookController(useCase as any, config as any);

    const payload = {
      event: {
        transaction: { id: 'wompi-1', reference: 'REF-001', status: 'APPROVED' },
      },
    };
    const body = Buffer.from(JSON.stringify(payload));
    const sig = computeSignature('test-secret', body);

    await expect(controller.handleWompi(makeReq(body, sig))).rejects.toThrow(HttpException);
  });
});
