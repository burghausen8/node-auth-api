import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { mockCartRepository } from './mocks/cart.repository.mock';
import { AddItemToCartDto } from './dto /add-item-to-cart.dto';
import { HttpService } from '@nestjs/axios';
import { mockHttpService } from './mocks/http.service.mock';
import { count } from 'console';
import { UpdateCartItemDto } from './dto /update-cart-item.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: mockCartRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addItem', () => {
    it('should update quantity when product already exists in cart', async () => {
      // Arrange
      const userId = 'user-1';

      const dto: AddItemToCartDto = {
        id: 'product-1',
        quantity: 2,
      };

      mockCartRepository.findByUserAndProduct.mockResolvedValue({
        id: 'cart-item-1',
        quantity: 3,
      });

      mockCartRepository.updateQuantity.mockResolvedValue({
        id: 'cart-item-1',
        quantity: 5,
      });

      // Act
      await service.addItem(userId, dto);

      // Assert
      expect(mockCartRepository.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        dto.id,
      );

      expect(mockCartRepository.updateQuantity).toHaveBeenCalledWith(
        'cart-item-1',
        5,
      );

      expect(mockCartRepository.addItem).not.toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    it('should add item when product dont exists in cart', async () => {
      // Arrange
      const userId = 'user-1';

      const dto: AddItemToCartDto = {
        id: 'product-1',
        quantity: 2,
      };

      mockCartRepository.updateQuantity.mockResolvedValue({
        id: 'cart-item-1',
        quantity: 2,
      });

      // Act
      await service.addItem(userId, dto);

      // Assert
      expect(mockCartRepository.findByUserAndProduct).toHaveBeenCalledWith(
        userId,
        dto.id,
      );

      expect(mockCartRepository.updateQuantity).not.toHaveBeenCalled();

      expect(mockCartRepository.addItem).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call repository count and find many', async () => {
      // Arrange
      const userId = 'user-1';
      const page = 1;
      const limit = 2;

      mockCartRepository.count.mockResolvedValue(0);

      mockCartRepository.findMany.mockResolvedValue([
        {
          id: 'cart-item-1',
          productId: 'product-1',
          quantity: 5,
          product: {
            id: 'product-1',
            name: 'iPhone',
            price: 100,
          },
        },
      ]);

      // Act
      const result = await service.findAll(userId, page, limit);

      // Assert
      expect(mockCartRepository.count).toHaveBeenCalledWith('user-1');

      expect(mockCartRepository.findMany).toHaveBeenCalledWith('user-1', 0, 2);

      expect(mockCartRepository.addItem).not.toHaveBeenCalled();

      expect(result).toEqual({
        items: [
          {
            productId: 'product-1',
            name: 'iPhone',
            quantity: 5,
          },
        ],
        total: 0,
        page: 1,
        limit: 2,
        totalPages: 0,
      });
    });
  });

  describe('findItemsByUser', () => {
    it('should call repository find items by user', async () => {
      // Arrange
      const userId = 'user-1';

      mockCartRepository.findItemsByUser.mockResolvedValue([
        {
          id: 'cart-item-1',
          productId: 'product-1',
          quantity: 5,
          product: {
            id: 'product-1',
            name: 'iPhone',
            price: 100,
          },
        },
      ]);

      // Act
      const result = await service.findItemsByUser(userId);

      // Assert

      expect(mockCartRepository.findItemsByUser).toHaveBeenCalledWith('user-1');

      expect(mockCartRepository.addItem).not.toHaveBeenCalled();

      expect(mockCartRepository.count).not.toHaveBeenCalled();

      expect(result).toEqual({
        items: [
          {
            id: 'cart-item-1',
            productId: 'product-1',
            quantity: 5,
            product: { id: 'product-1', name: 'iPhone', price: 100 },
          },
        ],
      });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when item does not exist', async () => {
      // Arrange
      const userId = 'user-1';
      const itemId = 'item-1';

      const dto = {
        quantity: 5,
      };

      mockCartRepository.findById.mockResolvedValue(null);

      // Act + Assert
      await expect(service.update(userId, itemId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockCartRepository.findById).toHaveBeenCalledWith(itemId);

      expect(mockCartRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when item belongs to another user', async () => {
      // Arrange
      const userId = 'user-1';
      const itemId = 'item-1';

      const dto = {
        quantity: 5,
      };

      mockCartRepository.findById.mockResolvedValue({
        id: itemId,
        userId: 'another-user',
        quantity: 2,
      });

      // Act + Assert
      await expect(service.update(userId, itemId, dto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockCartRepository.findById).toHaveBeenCalledWith(itemId);

      expect(mockCartRepository.update).not.toHaveBeenCalled();
    });

    it('should update cart item', async () => {
      // Arrange
      const userId = 'user-1';
      const itemId = 'item-1';

      const dto = {
        quantity: 5,
      };

      mockCartRepository.findById.mockResolvedValue({
        id: itemId,
        userId,
        quantity: 2,
      });

      mockCartRepository.update.mockResolvedValue({
        id: itemId,
        userId,
        quantity: 5,
      });

      // Act
      const result = await service.update(userId, itemId, dto);

      // Assert
      expect(mockCartRepository.findById).toHaveBeenCalledWith(itemId);

      expect(mockCartRepository.update).toHaveBeenCalledWith(itemId, dto);

      expect(result).toEqual({
        id: itemId,
        userId,
        quantity: 5,
      });
    });

    it('should call findById only once', async () => {
      const userId = 'user-1';
      const itemId = 'item-1';

      const dto = {
        quantity: 5,
      };

      mockCartRepository.findById.mockResolvedValue({
        id: itemId,
        userId,
        quantity: 2,
      });

      mockCartRepository.update.mockResolvedValue({});

      await service.update(userId, itemId, dto);

      expect(mockCartRepository.findById).toHaveBeenCalledTimes(1);
    });
  });
});
