import { createLogger, format, transports } from 'winston';
import { LogOptionsType } from '../@types';
import * as moment from 'moment';

const { combine, timestamp, label, printf } = format;

const myFormat = printf(
  ({ level, message, label, timestamp }) => `${timestamp} || [${label}] || ${level}: ${message}`
);

export const logger = async <T>({
  action,
  message,
  user,
  serviceLog,
  options = {
    email: '',
    phone: '',
    authId: '',
    profileId: '',
    deviceIP: ' ',
    deviceID: ' ',
    deviceName: ' ',
    sourceOS: ' ',
    apiRequest: ' ',
    apiResponse: ' ',
  },
}: LogOptionsType<T>) => {
  const logger = createLogger({
    format: combine(label({ label: `tracking action: ${action}` }), timestamp(), myFormat),
    transports: [new transports.Console()],
  });

  logger.log({ level: 'info', message });
};
