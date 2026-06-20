import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from '../types';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'No token provided'));
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_workhive_jwt_token_key_123456!';

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      role: 'seeker' | 'employer' | 'admin';
    };

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return next(new AppError(401, 'INVALID_TOKEN', 'Session expired or invalid token'));
  }
};
