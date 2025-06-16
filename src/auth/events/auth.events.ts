export enum AuthEvents {
  SIGN_UP_FINISHED = 'sign-up.finished',
}

export class SignUpFinishedEventDto {
  userId: string;
  email: string;
  fullName: string;
}
