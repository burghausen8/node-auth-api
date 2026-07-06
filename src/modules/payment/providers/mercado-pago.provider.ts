import { Injectable } from '@nestjs/common';
import {
  CreateCheckoutResponse,
  PaymentDetails,
  PaymentProvider,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class MercadoPagoProvider implements PaymentProvider {
  async createCheckout(orderId: string): Promise<CreateCheckoutResponse> {
    throw new Error('Not implemented');
  }

  async getPayment(paymentId: string): Promise<PaymentDetails> {
    throw new Error('Not implemented');
  }

  async cancel(paymentId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
