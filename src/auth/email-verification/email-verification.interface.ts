export interface EmailVerificationServiceConfig {
  app: {
    host: string;
    port: number;
  };
  emailVerification: {
    featureFlag: boolean;
  };
}
