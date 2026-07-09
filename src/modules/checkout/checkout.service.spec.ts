import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { PaymentService } from '../payment/payment.service';
import { mockCartServiceForCheckout } from './mocks/cart.service.mock';
import { mockOrderService } from './mocks/order.service.mock';
import { mockPaymentService } from './mocks/payment.service.mock';

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: CartService,
          useValue: mockCartServiceForCheckout,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  describe('checkout', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      // Arrange
      const userId = 'user-1';

      mockCartServiceForCheckout.findItemsByUser.mockResolvedValue({
        items: [],
      });

      // Act + Assert
      await expect(service.checkout(userId)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockOrderService.create).not.toHaveBeenCalled();
      expect(mockPaymentService.createCheckout).not.toHaveBeenCalled();
    });

    it('should create order and checkout with correct total', async () => {
      // Arrange
      const userId = 'user-1';
      const items = [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          product: { id: 'product-1', name: 'Tênis', price: '100.00' },
        },
        {
          id: 'item-2',
          productId: 'product-2',
          quantity: 1,
          product: { id: 'product-2', name: 'Meia', price: '20.50' },
        },
      ];

      const order = { id: 'order-1', total: 220.5 };
      const checkout = {
        preferenceId: 'pref-1',
        paymentUrl: 'https://mp.com/pay',
      };

      mockCartServiceForCheckout.findItemsByUser.mockResolvedValue({ items });
      mockOrderService.create.mockResolvedValue(order);
      mockPaymentService.createCheckout.mockResolvedValue(checkout);

      // Act
      const result = await service.checkout(userId);

      // Assert
      expect(mockCartServiceForCheckout.findItemsByUser).toHaveBeenCalledWith(
        userId,
      );
      expect(mockOrderService.create).toHaveBeenCalledWith(
        userId,
        items,
        220.5,
      );
      expect(mockPaymentService.createCheckout).toHaveBeenCalledWith(
        items,
        'order-1',
      );
      expect(result).toEqual({ order, checkout });
    });

    it('should calculate the total correctly from cart items', async () => {
      // Arrange
      const userId = 'user-1';
      const items = [
        {
          id: 'item-1',
          quantity: 3,
          product: { price: '10.00' },
        },
      ];

      mockCartServiceForCheckout.findItemsByUser.mockResolvedValue({ items });
      mockOrderService.create.mockResolvedValue({ id: 'order-1' });
      mockPaymentService.createCheckout.mockResolvedValue({});

      // Act
      await service.checkout(userId);

      // Assert
      expect(mockOrderService.create).toHaveBeenCalledWith(
        userId,
        items,
        30, // 3 * 10.00
      );
    });
  });
});
