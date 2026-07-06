export interface CreateCheckoutResponse {
  paymentUrl: string;
  paymentId: string;
}

export interface PaymentDetails {
  id: string;
  status: string;
  externalReference?: string;
}

export interface PaymentProvider {
  createCheckout(orderId: string): Promise<CreateCheckoutResponse>;

  getPayment(paymentId: string): Promise<PaymentDetails>;

  cancel(paymentId: string): Promise<void>;
}
