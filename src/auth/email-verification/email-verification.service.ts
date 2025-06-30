import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Token } from '../common/auth-common.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  AUTH_SIGN_IN_URL,
  EMAIL_VERIFICATION_TITLE,
  EMAIL_VERIFICATION_URL,
} from './constants';
import { UsersService } from '../../users/users.service';
import { AuthCommonService } from '../common/auth-common.service';
import { EmailVerificationServiceConfig } from './email-verification.interface';
import { SignUpFinishedEventDto } from '../events/auth.events';
import { TypeHelper } from '../../shared/helpers/type.helper';

@Injectable()
export class EmailVerificationService {
  private config: EmailVerificationServiceConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly authCommonService: AuthCommonService,
    private readonly usersService: UsersService,
  ) {
    this.config = {
      app: {
        host: this.configService.get('HOST'),
        port: this.configService.get('PORT'),
      },
      emailVerification: {
        featureFlag: TypeHelper.booleanStringToString(
          this.configService.get('EMAIL_VERIFICATION_FEATURE_FLAG'),
        ),
      },
    };
  }

  async verifyEmail(userId: string, response: Response): Promise<void> {
    const [, user] = await Promise.all([
      this.authCommonService.markAsVerified(userId),
      this.usersService.getById(userId),
    ]);

    this.renderEmailVerificationResponse(response, user.fullName);
  }

  async sendVerificationEmail({
    userId,
    email,
    fullName,
  }: SignUpFinishedEventDto) {
    if (!this.config.emailVerification.featureFlag) {
      return;
    }
    const verificationToken = this.authCommonService.generateToken(
      userId,
      Token.EMAIL_VERIFICATION,
    );

    const url = this.formVerificationUrl(verificationToken);

    await this.mailerService.sendMail({
      to: email,
      subject: EMAIL_VERIFICATION_TITLE,
      template: './src/templates/email-verification-templates/email-template',
      context: {
        url,
        fullName,
      },
    });
  }

  private formVerificationUrl(token: string): string {
    return `${this.config.app.port}:${this.config.app.host}${EMAIL_VERIFICATION_URL}?token=${token}`;
  }

  private renderEmailVerificationResponse(
    response: Response,
    fullName: string,
  ) {
    const url = `${this.config.app.host}:${this.config.app.port}${AUTH_SIGN_IN_URL}`;

    response.render(
      join(
        __dirname,
        '..',
        '..',
        '..',
        'src',
        'templates',
        'email-verification-response-templates',
        'response.hbs',
      ),
      {
        fullName,
        url,
      },
    );
  }
}
