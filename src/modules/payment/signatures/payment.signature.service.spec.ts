import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentSignatureService } from './payment.signature.service';
import { mockConfigService } from '../mocks/config.service.mock';

const SECRET = 'test-secret';

function buildSignature(
  secret: string,
  dataId: string,
  requestId: string,
  ts: string,
): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');
  return `ts=${ts},v1=${hash}`;
}

describe('PaymentSignatureService', () => {
  let service: PaymentSignatureService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentSignatureService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentSignatureService>(PaymentSignatureService);
  });

  describe('validate', () => {
    it('should not throw when signature is valid', () => {
      // Arrange
      const dataId = 'payment-1';
      const requestId = 'req-123';
      const ts = '1700000000';
      const signature = buildSignature(SECRET, dataId, requestId, ts);

      mockConfigService.getOrThrow.mockReturnValue(SECRET);

      // Act + Assert
      expect(() =>
        service.validate(signature, requestId, dataId),
      ).not.toThrow();
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(
        'MERCADO_PAGO_WEBHOOK_SECRET',
      );
    });

    it('should throw UnauthorizedException when signature hash does not match', () => {
      // Arrange
      const dataId = 'payment-1';
      const requestId = 'req-123';
      const ts = '1700000000';
      const signature = `ts=${ts},v1=invalid-hash`;

      mockConfigService.getOrThrow.mockReturnValue(SECRET);

      // Act + Assert
      expect(() => service.validate(signature, requestId, dataId)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when signature is tampered', () => {
      // Arrange
      const dataId = 'payment-1';
      const requestId = 'req-123';
      const ts = '1700000000';

      // Build signature for a DIFFERENT dataId
      const signature = buildSignature(SECRET, 'other-id', requestId, ts);

      mockConfigService.getOrThrow.mockReturnValue(SECRET);

      // Act + Assert
      expect(() => service.validate(signature, requestId, dataId)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
