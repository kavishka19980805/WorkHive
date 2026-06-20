import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../errors/AppError';

export class AuthService {
  async register(email: string, passwordPlain: string, role: 'seeker' | 'employer' | 'admin') {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(400, 'EMAIL_EXISTS', 'A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user = await userRepository.create(email, passwordHash, role as any);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async login(email: string, passwordPlain: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_workhive_jwt_token_key_123456!';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
