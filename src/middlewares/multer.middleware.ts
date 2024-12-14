import multer from 'multer';
import path from 'path';
import fs from 'fs';

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, req.res.locals.validatedIdRequest.id);
  },
});

export const UploadMongoMiddleware = multer({ storage });
