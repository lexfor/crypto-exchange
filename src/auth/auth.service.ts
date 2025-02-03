import { Injectable } from '@nestjs/common';
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
} from './auth.dto';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { EMAIL_VERIFICATION_TITLE } from './constants';

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

  async setRefreshToken(userId: string, refreshToken: string) {
    const auth = await this.authRepository.findOne({
      where: { user: { id: userId } },
    });

    auth['refreshToken'] = refreshToken;

    return this.authRepository.save(auth);
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
}
