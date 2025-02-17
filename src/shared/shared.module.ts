import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormFactory } from './factories/typeorm.factory';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerFactory } from './factories/mailer.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeormFactory),
    JwtModule.register({ global: true }),
    MailerModule.forRootAsync(mailerFactory),
  ],
})
export class SharedModule {}
