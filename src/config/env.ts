import { config } from 'dotenv';

console.log({
  env_path: `.env.${process.env.NODE_ENV || 'development'}.local`,
});

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const MONGO_URIS = {
  auth: process.env.AUTH_MONGO_URI,
  service: process.env.SERVICE_MONGO_URI,
};

export const CREDENTIALS = process.env.CREDENTIALS === 'true';

export const {
  NODE_ENV,
  BASE_URL,
  PORT,
  JWT_SECRET_KEY,
  ORIGIN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  NODEMAILER_SERVICE,
  NODEMAILER_HOST,
  NODEMAILER_PORT,
  NODEMAILER_SECURE,
  NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD,
  NODEMAILER_NAME,
  REDIS_URL,
  MONGO_URI,
  PAYPAL_URL,
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  STRIPE_URL,
  STRIPE_SECRET_KEY,
  APPLICATION_NAME,
  GOOGLE_CLIENT_ID,
} = process.env;
