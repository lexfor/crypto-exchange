import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthServiceConfig } from './auth.interface';
import { ConfigService } from '@nestjs/config';
import { JWTTokens, SignInDto, SignUpDto, Token } from './auth.dto';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private config: AuthServiceConfig;
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
    private readonly usersService: UsersService,
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
    return await this.createAuth(email, hash, user);
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
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(userId, Token.ACCESS),
      this.generateToken(userId, Token.REFRESH),
    ]);

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

  private generateToken(userId: string, token: Token): Promise<string> {
    const JWTConfig =
      token === Token.ACCESS ? this.config.jwt : this.config.jwtRefresh;
    return this.jwtService.signAsync({ userId }, JWTConfig);
  }
}
