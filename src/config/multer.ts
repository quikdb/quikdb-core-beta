import { GridFsStorage } from 'multer-gridfs-storage';
import { AUTH_MONGO_URI } from './env';

export const gridFsStorage = new GridFsStorage({
  url: AUTH_MONGO_URI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'fs', // default bucket for GridFS
      metadata: { fileType: file.mimetype },
    };
  },
});
