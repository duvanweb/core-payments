import { Controller, HttpCode, Inject, Post, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { createHmac } from 'crypto';
import type { Request } from 'express';
import {
  HandleWompiWebhookUseCasePort,
  HANDLE_WOMPI_WEBHOOK_USE_CASE,
} from '@application/ports/use-cases/handle-wompi-webhook.use-case.port';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    @Inject(HANDLE_WOMPI_WEBHOOK_USE_CASE)
    private readonly handleWebhookUseCase: HandleWompiWebhookUseCasePort,
    private readonly configService: ConfigService,
  ) {}

  @Post('wompi')
  @HttpCode(200)
  @ApiOperation({ summary: 'Wompi webhook receiver' })
  async handleWompi(@Req() req: RawBodyRequest): Promise<void> {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new HttpException(
        { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Raw body not available' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const signature = req.headers['x-event-signature'] as string | undefined;
    const eventsSecret = this.configService.get<string>('WOMPI_EVENTS_SECRET');

    if (!signature || !eventsSecret) {
      throw new HttpException(
        { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Missing signature or secret' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const computed = createHmac('sha256', eventsSecret).update(rawBody).digest('hex');
    if (computed !== signature) {
      throw new HttpException(
        { code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Signature verification failed' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = JSON.parse(rawBody.toString());
    const transaction = payload?.event?.transaction ?? payload?.data?.transaction;

    if (!transaction) {
      return;
    }

    await this.handleWebhookUseCase
      .execute({
        reference: transaction.reference,
        status: transaction.status,
        wompiTransactionId: transaction.id,
      })
      .match(
        () => undefined,
        (error) => {
          throw new HttpException(
            { code: error.code, message: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        },
      );
  }
}
