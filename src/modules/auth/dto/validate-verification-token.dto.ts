import { IsEmail } from 'class-validator';

export class ValidateVerificationTokenDto {
  @IsEmail()
  email: string;
  token: string;
}
