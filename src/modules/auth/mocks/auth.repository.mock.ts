export const mockAuthRepository = {
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  deleteVerificationTokensByUser: jest.fn(),
  createVerificationToken: jest.fn(),
  findByEmail: jest.fn(),
  resendVerificationEmailTransaction: jest.fn(),
  findVerificationToken: jest.fn(),
  validateUser: jest.fn(),
};
