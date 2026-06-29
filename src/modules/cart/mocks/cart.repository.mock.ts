export const mockCartRepository = {
  addItem: jest.fn(),
  findMany: jest.fn(),
  findItemsByUser: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  findByUserAndProduct: jest.fn(),
  updateQuantity: jest.fn(),
};
