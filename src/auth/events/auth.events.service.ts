import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthEvents, SignUpFinishedEventDto } from './auth.events';
import { AuthEntity } from '../entities/auth.entity';

@Injectable()
export class AuthEventsService {
  constructor(private eventEmitter: EventEmitter2) {}

  async publishUserFinishSignUpEvent(auth: AuthEntity): Promise<void> {
    const dto: SignUpFinishedEventDto = {
      userId: auth.userId,
      email: auth.email,
      fullName: auth.user.fullName,
    };
    this.eventEmitter.emit(AuthEvents.SIGN_UP_FINISHED, dto);
  }
}
