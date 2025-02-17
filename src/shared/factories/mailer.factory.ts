import { ConfigService } from '@nestjs/config';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailerFactory: MailerAsyncOptions = {
  useFactory: (configService: ConfigService) => {
    return <MailerOptions>{
      transport: {
        host: configService.get('EMAIL_HOST'),
        port: configService.get('EMAIL_PORT'),
        secure: false,
        auth: {
          user: configService.get('EMAIL_USER'),
          pass: configService.get('EMAIL_PASS'),
        },
      },
      defaults: {
        from: `"No Reply" <${configService.get('EMAIL_USER')}>`,
      },
      template: {
        dir: join(__dirname, '../..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      options: {
        debug: true,
        logger: true,
      },
    };
  },
  inject: [ConfigService],
};
