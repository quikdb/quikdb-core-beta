import { gridFsStorage } from '@/config';
import multer from 'multer';

export const UploadMongoMiddleware = multer({ storage: gridFsStorage });
