import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailVerificationService } from '../email-verification.service';
import { AuthEvents, SignUpFinishedEventDto } from '../../events/auth.events';

@Injectable()
export class EmailVerificationEventsListener {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @OnEvent(AuthEvents.SIGN_UP_FINISHED, { async: true })
  async handleUserFinishedSignUp(dto: SignUpFinishedEventDto): Promise<void> {
    await this.emailVerificationService.sendVerificationEmail(dto);
  }
}
