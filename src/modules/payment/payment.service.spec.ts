import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentPublisher } from './publishers/payment.publisher';
import { mockPaymentPublisher } from './mocks/payment.publisher.mock';
import { PAYMENT_PROVIDER } from './constants/payment.constants';
import { mockPaymentProvider } from './mocks/payment.provider.mock';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentPublisher,
          useValue: mockPaymentPublisher,
        },
        {
          provide: PAYMENT_PROVIDER,
          useValue: mockPaymentProvider,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('receiveWebhook', () => {
    it('should publish the webhook event and return success', async () => {
      // Arrange
      const dto = {
        action: 'payment.updated',
        type: 'payment',
        data: { id: 'payment-1' },
      };

      mockPaymentPublisher.publish.mockResolvedValue(undefined);

      // Act
      const result = await service.receiveWebhook(dto as any);

      // Assert
      expect(mockPaymentPublisher.publish).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        message: 'Webhook received successfully',
      });
    });
  });

  describe('createCheckout', () => {
    it('should call provider createCheckout with mapped items', async () => {
      // Arrange
      const items = [
        {
          id: 'cart-item-1',
          productId: 'product-1',
          quantity: 2,
          product: { name: 'Tênis Nike', price: '299.99' },
        },
      ] as any;
      const orderId = 'order-1';

      mockPaymentProvider.createCheckout.mockResolvedValue({
        preferenceId: 'pref-1',
        paymentUrl: 'https://mp.com/pay',
      });

      // Act
      const result = await service.createCheckout(items, orderId);

      // Assert
      expect(mockPaymentProvider.createCheckout).toHaveBeenCalledWith({
        externalReference: orderId,
        items: [
          {
            id: 'cart-item-1',
            title: 'Tênis Nike',
            quantity: 2,
            unitPrice: 299.99,
          },
        ],
      });
      expect(result).toEqual({
        preferenceId: 'pref-1',
        paymentUrl: 'https://mp.com/pay',
      });
    });
  });

  describe('getPaymentInfo', () => {
    it('should delegate to the provider', async () => {
      // Arrange
      const paymentInfo = {
        id: 'payment-1',
        status: 'approved',
        externalReference: 'order-1',
      };

      mockPaymentProvider.getPaymentInfo.mockResolvedValue(paymentInfo);

      // Act
      const result = await service.getPaymentInfo('payment-1');

      // Assert
      expect(mockPaymentProvider.getPaymentInfo).toHaveBeenCalledWith(
        'payment-1',
      );
      expect(result).toEqual(paymentInfo);
    });
  });

  describe('cancel', () => {
    it('should delegate cancellation to the provider', async () => {
      // Arrange
      mockPaymentProvider.cancel.mockResolvedValue(undefined);

      // Act
      await service.cancel('payment-1');

      // Assert
      expect(mockPaymentProvider.cancel).toHaveBeenCalledWith('payment-1');
    });
  });
});
