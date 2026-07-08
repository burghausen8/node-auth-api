import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentSignatureService {
  constructor(private readonly config: ConfigService) {}

  validate(signature: string, requestId: string, dataId: string) {
    const secret = this.config.getOrThrow('MERCADO_PAGO_WEBHOOK_SECRET');

    const parts = signature.split(',').reduce(
      (acc, item) => {
        const [key, value] = item.split('=');

        acc[key] = value;

        return acc;
      },
      {} as Record<string, string>,
    );

    const ts = parts.ts;
    const v1 = parts.v1;

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    const hash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    if (hash !== v1) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
