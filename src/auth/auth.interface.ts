export interface AuthServiceConfig {
  jwt: JWTConfig;
  jwtRefresh: JWTConfig;
  hash: {
    salt: number;
  };
  jwtEmailVerification: JWTConfig;
}

export interface JWTConfig {
  secret: string;
  expiresIn: number;
}
