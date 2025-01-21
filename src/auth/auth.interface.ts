export interface AuthServiceConfig {
  jwt: JWTConfig;
  jwtRefresh: JWTConfig;
  hash: {
    salt: number;
  };
}

export interface JWTConfig {
  secret: string;
  expiresIn: number;
}
