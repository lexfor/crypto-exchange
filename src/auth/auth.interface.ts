export interface AuthControllerConfig {
  cookie: {
    refreshToken: {
      expiresIn: number;
    };
  };
}

export interface AuthServiceConfig {
  signUp: {
    featureFlag: boolean;
  };
  signIn: {
    featureFlag: boolean;
  };
}
