import { Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { AuthenticatedRequest } from '../types';

export const rbacMiddleware = (allowedRoles: ('seeker' | 'employer' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          'FORBIDDEN',
          `Access denied. Role '${req.user.role}' does not have permission.`
        )
      );
    }

    next();
  };
};
