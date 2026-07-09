export const mockOrderRepository = {
  createOrder: jest.fn(),
  createOrderItem: jest.fn(),
  checkout: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
  updatePaymentId: jest.fn(),
};
