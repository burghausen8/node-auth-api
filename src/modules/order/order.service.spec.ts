import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OrderService } from './order.service';
import { OrderRepository } from './repositories/order.repository';
import { mockOrderRepository } from './mocks/order.repository.mock';
import { CartService } from '../cart/cart.service';
import { mockCartService } from './mocks/cart.service.mock';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      // Arrange
      const userId = '1';

      mockCartService.findItemsByUser.mockResolvedValue({ items: [] });

      // Act + Assert
      await expect(service.create(userId)).rejects.toThrow(BadRequestException);

      expect(mockCartService.findItemsByUser).toHaveBeenCalledWith('1');

      expect(mockOrderRepository.checkout).not.toHaveBeenCalled();
    });

    it('should save order', async () => {
      // Arrange
      const userId = '1';

      mockCartService.findItemsByUser.mockResolvedValue({
        items: [{ product: { id: 1, name: 'pão de batata', price: 10 } }],
      });

      // Act + Assert
      const result = await service.create(userId);

      expect(mockCartService.findItemsByUser).toHaveBeenCalledWith('1');

      expect(result).toEqual(undefined);
    });
  });
});
