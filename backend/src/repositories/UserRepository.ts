import prisma from './prisma';
import { Role } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(email: string, passwordHash: string, role: Role) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
  }
}

export const userRepository = new UserRepository();
