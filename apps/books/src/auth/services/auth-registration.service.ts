import { AuthTokenTypes, Genders, generateOtp, isStrongPassword, isValidEmailId } from '@app/core';
import { AuthTokensService, DbService } from '@app/infra';
import { AppMailerService } from '@app/integrations';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EncryptionService } from '@saiuttej/nestjs-encryptions';
import { resolve } from 'path';
import { UserRepository } from '../../db/repositories/user.repository';
import { RegisterDto, VerifyRegistrationOtpDto } from '../dtos/register.dto';

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly authTokenService: AuthTokensService,
    private readonly appMailerService: AppMailerService,
    private readonly dbService: DbService,
  ) {}

  async register(reqBody: RegisterDto) {
    await this.validateRegisterBody(reqBody);

    const otp = generateOtp();
    const emailBody = await this.appMailerService.generateHtmlFromTemplate({
      templatePath: resolve(__dirname, '..', 'templates', 'account-email-verification.hbs'),
      values: {
        appName: 'Books App',
        otp,
      },
    });

    const token = await this.dbService.transaction({
      execute: async () => {
        const reqToken = await this.authTokenService.createToken({
          tokenType: AuthTokenTypes.EMAIL_VERIFICATION,
          expiresAt: new Date(new Date().getTime() + 10 * 60 * 1000),
          metadata: {
            otp: await this.encryptionService.hash(otp),
            reqBody: {
              ...reqBody,
              password: await this.encryptionService.hash(reqBody.password),
            },
          },
        });

        await this.appMailerService.sendEmail({
          to: [{ address: reqBody.email, name: reqBody.fullName }],
          subject: 'Account Email Verification',
          body: emailBody,
        });

        return reqToken.id;
      },
    });

    return {
      message: `Account verification OTP has been sent to ${reqBody.email}. OTP is valid for 10 minutes.`,
      token: token,
    };
  }

  async verifyRegistrationOtp(reqBody: VerifyRegistrationOtpDto) {
    const authToken = await this.authTokenService.findTokenById(reqBody.token);
    if (!authToken) {
      throw new BadRequestException('Invalid verification token');
    }
    if (authToken.tokenType !== AuthTokenTypes.EMAIL_VERIFICATION) {
      throw new BadRequestException('Invalid verification token type');
    }
    if (new Date(authToken.expiresAt) < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    const tokenOtp = authToken.metadata?.otp as string;
    const isOtpValid = await this.encryptionService.compareHash(reqBody.otp, tokenOtp);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const reqRegisterBody = authToken.metadata?.reqBody as RegisterDto;
    if (!reqRegisterBody) {
      throw new BadRequestException('Invalid verification token data');
    }

    await this.validateRegisterBody(reqRegisterBody, true);

    const user = this.userRepo.instance({
      fullName: reqRegisterBody.fullName,
      email: reqRegisterBody.email,
      gender: reqRegisterBody.gender,
      password: reqRegisterBody.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.dbService.transaction({
      execute: async () => {
        await this.userRepo.create(user);
        await this.authTokenService.removeToken(authToken.id);
      },
    });

    return {
      message: 'Account registered successfully. Please login to continue.',
    };
  }

  private async validateRegisterBody(reqBody: RegisterDto, skipPassword = false) {
    const validEmail = isValidEmailId(reqBody.email);
    if (!validEmail.isValid) {
      throw new BadRequestException(`Invalid Email Id: ${validEmail.errors.join(', ')}`);
    }

    if (!reqBody.gender) {
      throw new BadRequestException('Gender is required');
    }
    if (!Object.values(Genders).includes(reqBody.gender)) {
      throw new BadRequestException(`Gender must be one of ${Object.values(Genders).join(', ')}`);
    }

    if (!reqBody.fullName) {
      throw new BadRequestException('Full name is required');
    }

    if (!skipPassword) {
      const validPassword = isStrongPassword(reqBody.password);
      if (!validPassword.isValid) {
        throw new BadRequestException(`Invalid Password: ${validPassword.errors.join(', ')}`);
      }
    }

    const emailExists = await this.userRepo.existsByEmail({ email: reqBody.email });
    if (emailExists) {
      throw new BadRequestException(`Email Id "${reqBody.email}" already taken`);
    }
  }
}
