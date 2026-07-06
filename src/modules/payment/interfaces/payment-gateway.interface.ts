export interface PaymentDetails {
  id: string;
  status: string;
  externalReference?: string;
}

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateCheckoutRequest {
  externalReference: string;
  items: CheckoutItem[];
}

export interface CreateCheckoutResponse {
  preferenceId: string;
  paymentUrl: string;
}
export interface PaymentProvider {
  createCheckout(
    request: CreateCheckoutRequest,
  ): Promise<CreateCheckoutResponse>;

  getPayment(paymentId: string): Promise<PaymentDetails>;

  cancel(paymentId: string): Promise<void>;
}
