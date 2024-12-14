import nodemailer from 'nodemailer';
import {
  NODEMAILER_SERVICE,
  NODEMAILER_HOST,
  NODEMAILER_PORT,
  NODEMAILER_SECURE,
  NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD,
  NODEMAILER_NAME,
} from '../config';

const config = {
  service: NODEMAILER_SERVICE,
  host: NODEMAILER_HOST,
  port: Number(NODEMAILER_PORT),
  secure: !!Number(NODEMAILER_SECURE),
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"${NODEMAILER_NAME}" <${NODEMAILER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.info('info', `Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
