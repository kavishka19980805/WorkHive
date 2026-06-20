import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/AuthService';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['seeker', 'employer', 'admin'], {
    errorMap: () => ({ message: "Role must be 'seeker', 'employer', or 'admin'" }),
  }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = registerSchema.parse(req.body);
      const user = await authService.register(email, password, role);

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0].message,
          },
        });
      }
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const data = await authService.login(email, password);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: err.errors[0].message,
          },
        });
      }
      next(err);
    }
  }
}

export const authController = new AuthController();
