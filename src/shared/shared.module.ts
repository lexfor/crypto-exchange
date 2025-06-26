import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormFactory } from './factories/typeorm.factory';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerFactory } from './factories/mailer.factory';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeormFactory),
    JwtModule.register({ global: true }),
    MailerModule.forRootAsync(mailerFactory),
    EventEmitterModule.forRoot(),
  ],
})
export class SharedModule {}
