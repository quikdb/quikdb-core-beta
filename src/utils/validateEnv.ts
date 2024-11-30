import { cleanEnv, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    APPLICATION_NAME: str(),
    API_BASE_URL: str(),
    NODE_ENV: str({
      choices: ['development', 'production', 'test'],
    }),
    PORT: port(),
    JWT_SECRET_KEY: str(),
    ORIGIN: str(),
    AUTH_MONGO_URI: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GOOGLE_REDIRECT_URI: str(),
    ENCRYPTION_KEY: str(),
    ENCRYPTION_RANDOMIZER: str(),
    CLOUDINARY_CLOUD_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    NODEMAILER_SERVICE: str(),
    NODEMAILER_HOST: str(),
    NODEMAILER_PORT: str(),
    NODEMAILER_SECURE: str(),
    NODEMAILER_EMAIL: str(),
    NODEMAILER_PASSWORD: str(),
    NODEMAILER_NAME: str(),
    PAYPAL_URL: str(),
    PAYPAL_CLIENT_ID: str(),
    PAYPAL_CLIENT_SECRET: str(),
    STRIPE_URL: str(),
    STRIPE_SECRET_KEY: str(),
  });
};
