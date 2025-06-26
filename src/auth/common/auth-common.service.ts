import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthServiceConfig } from './auth-common.interface';
import { ConfigService } from '@nestjs/config';
import {
  CreateAuthDto,
  JWTTokens,
  Token,
  TokenPayload,
} from './auth-common.dto';
import { UsersEntity } from '../../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../auth.dto';
import { messages } from '../messages';

@Injectable()
export class AuthCommonService {
  private config: AuthServiceConfig;
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async create({ email, password, user }: CreateAuthDto): Promise<AuthEntity> {
    const hash = await this.hashPassword(password);
    return await this.createEntity(email, hash, user);
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

  async createEntity(
    email: string,
    password: string,
    user: UsersEntity,
  ): Promise<AuthEntity> {
    const auth = this.authRepository.create({ email, password, user });
    return await this.authRepository.save(auth);
  }

  async markAsVerified(userId: string): Promise<void> {
    await this.authRepository.update({ userId }, { isVerified: true });
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
    return await this.authRepository.update(
      {
        userId,
      },
      { refreshToken },
    );
  }

  generateToken(userId: string, token: Token): string {
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
}
