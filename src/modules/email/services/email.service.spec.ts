import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SmtpProvider } from '../providers/mail.provider';
import { mockSmtpProvider } from '../mocks/smtp.provider.mock';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: SmtpProvider,
          useValue: mockSmtpProvider,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendVerificationEmail', () => {
    it('should call smtpProvider.sendMail with correct email and subject', async () => {
      // Arrange
      const email = 'user@mail.com';
      const code = '123456';

      mockSmtpProvider.sendMail.mockResolvedValue(undefined);

      // Act
      await service.sendVerificationEmail(email, code);

      // Assert
      expect(mockSmtpProvider.sendMail).toHaveBeenCalledTimes(1);
      expect(mockSmtpProvider.sendMail).toHaveBeenCalledWith(
        email,
        'Confirmação de cadastro',
        expect.stringContaining(code),
      );
    });

    it('should include the verification code inside the html body', async () => {
      // Arrange
      const email = 'user@mail.com';
      const code = '654321';

      let capturedHtml = '';
      mockSmtpProvider.sendMail.mockImplementation(
        async (_to: string, _subject: string, html: string) => {
          capturedHtml = html;
        },
      );

      // Act
      await service.sendVerificationEmail(email, code);

      // Assert
      expect(capturedHtml).toContain(code);
    });

    it('should propagate errors thrown by the smtp provider', async () => {
      // Arrange
      mockSmtpProvider.sendMail.mockRejectedValue(new Error('SMTP failure'));

      // Act + Assert
      await expect(
        service.sendVerificationEmail('user@mail.com', '000000'),
      ).rejects.toThrow('SMTP failure');
    });
  });
});
