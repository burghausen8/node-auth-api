import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { mockOrderRepository } from './mocks/order.repository.mock';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    it('should call repository checkout with correct params', async () => {
      // Arrange
      const userId = 'user-1';
      const items = [{ id: 'item-1' }] as any;
      const total = 100;

      mockOrderRepository.checkout.mockResolvedValue({ id: 'order-1' });

      // Act
      const result = await service.create(userId, items, total);

      // Assert
      expect(mockOrderRepository.checkout).toHaveBeenCalledWith(
        userId,
        items,
        total,
      );
      expect(result).toEqual({ id: 'order-1' });
    });
  });

  describe('processPayment', () => {
    it('should update order status to PAID when order exists and payment is approved', async () => {
      // Arrange
      const paymentData = {
        id: 'payment-1',
        status: 'approved',
        externalReference: 'order-1',
      };

      mockOrderRepository.findById.mockResolvedValue({ id: 'order-1' });
      mockOrderRepository.updateStatus.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PAID,
      });

      // Act
      await service.processPayment(paymentData);

      // Assert
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-1');
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.PAID,
      );
    });

    it('should not update status when order does not exist', async () => {
      // Arrange
      const paymentData = {
        id: 'payment-1',
        status: 'approved',
        externalReference: 'order-404',
      };

      mockOrderRepository.findById.mockResolvedValue(undefined);

      // Act
      await service.processPayment(paymentData);

      // Assert
      expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should not update status when payment is not approved', async () => {
      // Arrange
      const paymentData = {
        id: 'payment-1',
        status: 'pending',
        externalReference: 'order-1',
      };

      mockOrderRepository.findById.mockResolvedValue({ id: 'order-1' });

      // Act
      await service.processPayment(paymentData);

      // Assert
      expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('updatePaymentId', () => {
    it('should call repository updatePaymentId with correct params', async () => {
      // Arrange
      const orderId = 'order-1';
      const paymentId = 'payment-1';

      mockOrderRepository.updatePaymentId.mockResolvedValue({
        id: orderId,
        paymentId,
      });

      // Act
      const result = await service.updatePaymentId(orderId, paymentId);

      // Assert
      expect(mockOrderRepository.updatePaymentId).toHaveBeenCalledWith(
        orderId,
        paymentId,
      );
      expect(result).toEqual({ id: orderId, paymentId });
    });
  });
});
