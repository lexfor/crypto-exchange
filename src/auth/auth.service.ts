import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthServiceConfig } from './auth.interface';
import { ConfigService } from '@nestjs/config';
import {
  JWTTokens,
  SendEmailVerificationDto,
  SignInDto,
  SignUpDto,
  Token,
  TokenPayload,
} from './auth.dto';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_VERIFICATION_TITLE } from './constants';
import { Response } from 'express';
import { join } from 'path';
import { messages } from './messages';

@Injectable()
export class AuthService {
  private config: AuthServiceConfig;
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {
    this.config = {
      jwt: {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: Number(this.configService.get('JWT_EXPIRES_IN')),
      },
      jwtRefresh: {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: Number(this.configService.get('JWT_REFRESH_EXPIRES_IN')),
      },
      jwtEmailVerification: {
        secret: this.configService.get('JWT_EMAIL_VERIFICATION_SECRET'),
        expiresIn: Number(
          this.configService.get('JWT_EMAIL_VERIFICATION_EXPIRES_IN'),
        ),
      },
      hash: {
        salt: Number(this.configService.get('HASH_SALT')),
      },
    };
  }

  async signUp({
    email,
    password,
    username,
    fullName,
  }: SignUpDto): Promise<AuthEntity> {
    const user = await this.usersService.create({ username, fullName });
    const hash = await this.hashPassword(password);
    const auth = await this.createAuth(email, hash, user);
    await this.sendVerificationEmail({ userId: user.id, email, fullName });
    return auth;
  }

  async login({ email, password }: SignInDto): Promise<AuthEntity | null> {
    const auth = await this.authRepository.findOne({
      where: { email },
      relations: ['user'],
    });
    if (!auth || !(await this.comparePasswords(password, auth.password))) {
      return null;
    }
    return auth;
  }

  async createAuth(
    email: string,
    password: string,
    user: UsersEntity,
  ): Promise<AuthEntity> {
    const auth = this.authRepository.create({ email, password, user });
    return await this.authRepository.save(auth);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(this.config.hash.salt);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateJWTTokens(userId: string): Promise<JWTTokens> {
    const accessToken = this.generateToken(userId, Token.ACCESS),
      refreshToken = this.generateToken(userId, Token.REFRESH);

    await this.setRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(userId: string, response: Response): Promise<void> {
    const [, user] = await Promise.all([
      this.authRepository.update({ userId }, { isVerified: true }),
      this.usersService.getById(userId),
    ]);

    this.renderEmailVerificationResponse(response, user.fullName);
  }

  async setRefreshToken(userId: string, refreshToken: string) {
    return await this.authRepository.update(
      {
        userId,
      },
      { refreshToken },
    );
  }

  async sendVerificationEmail({
    userId,
    email,
    fullName,
  }: SendEmailVerificationDto) {
    const verificationToken = this.generateToken(
      userId,
      Token.EMAIL_VERIFICATION,
    );

    const url = this.formVerificationUrl(verificationToken);

    await this.mailerService.sendMail({
      to: email,
      subject: EMAIL_VERIFICATION_TITLE,
      template: './email-verification-templates/email-template',
      context: {
        url,
        fullName,
      },
    });
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const auth = await this.authRepository.findOneBy({
      userId,
    });

    return auth?.refreshToken ?? null;
  }

  async verifyRefreshToken(refreshToken: string): Promise<string> {
    try {
      const { userId } = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const { refreshToken: savedRefreshToken } =
        await this.authRepository.findOneBy({ userId });

      if (refreshToken !== savedRefreshToken) {
        throw new Error();
      }

      return userId;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(messages.WRONG_REFRESH_TOKEN);
    }
  }

  private generateToken(userId: string, token: Token): string {
    switch (token) {
      case Token.ACCESS:
        return this.jwtService.sign({ userId }, this.config.jwt);
      case Token.REFRESH:
        return this.jwtService.sign({ userId }, this.config.jwtRefresh);
      case Token.EMAIL_VERIFICATION:
        return this.jwtService.sign(
          { userId },
          this.config.jwtEmailVerification,
        );
    }
  }

  private formVerificationUrl(token: string): string {
    const host = this.configService.get('HOST');
    const port = this.configService.get('PORT');

    return `${host}:${port}/auth/email/verify?token=${token}`;
  }

  private renderEmailVerificationResponse(
    response: Response,
    fullName: string,
  ) {
    const host = this.configService.get('HOST');
    const port = this.configService.get('PORT');

    const url = `${host}:${port}/auth/sign-in`;

    response.render(
      join(
        __dirname,
        '..',
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
