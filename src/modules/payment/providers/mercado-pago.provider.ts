import { Injectable, Logger } from '@nestjs/common';
import {
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  PaymentDetails,
  PaymentProvider,
} from '../interfaces/payment-gateway.interface';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoProvider implements PaymentProvider {
  private readonly client: MercadoPagoConfig;
  private readonly logger = new Logger(MercadoPagoProvider.name);

  constructor(private readonly config: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: this.config.getOrThrow('MERCADO_PAGO_ACCESS_TOKEN'),
    });
  }

  async createCheckout(
    request: CreateCheckoutRequest,
  ): Promise<CreateCheckoutResponse> {
    const preference = new Preference(this.client);

    const response = await preference.create({
      body: {
        external_reference: request.externalReference,

        items: request.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: 'BRL',
        })),
        notification_url: `${this.config.get('API_URL')}/payments/webhook`,
      },
    });

    this.logger.log('Create payment mercado pago');
    this.logger.log(response);

    return {
      preferenceId: response.id!,
      paymentUrl: response.init_point!,
    };
  }
  async getPaymentInfo(paymentId: string): Promise<PaymentDetails> {
    const payment = new Payment(this.client);

    const response = await payment.get({
      id: paymentId,
    });

    this.logger.log(`Payment ${paymentId} retrieved`);
    this.logger.log(response);

    return {
      id: response.id!.toString(),
      status: response.status ?? 'unknown',
      externalReference: response.external_reference ?? undefined,
    };
  }

  async cancel(paymentId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
