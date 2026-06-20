import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../errors/AppError';

const storage = multer.diskStorage({
  destination: (req: any, file, cb) => {
    // Relative to the backend project root directory
    const dir = path.resolve(__dirname, '../../../uploads/resumes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req: any, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const userId = req.user?.id || 'anonymous';
    cb(null, `resume-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  fileFilter: (req: any, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only PDF resumes are allowed') as any, false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
