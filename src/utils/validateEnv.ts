import { cleanEnv, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    APPLICATION_NAME: str(),
    NODE_ENV: str({
      choices: ['development', 'production', 'test'],
    }),
    PORT: port(),
    JWT_SECRET_KEY: str(),
    ORIGIN: str(),
    AUTH_MONGO_URI: str(),
  });
};
