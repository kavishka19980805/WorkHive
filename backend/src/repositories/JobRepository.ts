import prisma from './prisma';
import { JobStatus, Prisma } from '@prisma/client';

export class JobRepository {
  async create(data: {
    employerId: string;
    title: string;
    description: string;
    location: string;
    category: string;
    salaryMin: number;
    salaryMax: number;
  }) {
    return prisma.job.create({
      data: {
        employerId: data.employerId,
        title: data.title,
        description: data.description,
        location: data.location,
        category: data.category,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        status: JobStatus.active,
      },
    });
  }

  async findById(id: string) {
    return prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filters: {
    category?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    search?: string;
    status?: JobStatus;
  }) {
    const where: Prisma.JobWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      // By default, only list active jobs unless specified (e.g. for admin panel)
      where.status = JobStatus.active;
    }

    if (filters.category) {
      where.category = {
        equals: filters.category,
        mode: 'insensitive',
      };
    }

    if (filters.location) {
      where.location = {
        equals: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters.minSalary !== undefined) {
      where.salaryMax = {
        gte: filters.minSalary,
      };
    }

    if (filters.maxSalary !== undefined) {
      where.salaryMin = {
        lte: filters.maxSalary,
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.job.findMany({
      where,
      include: {
        employer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      location: string;
      category: string;
      salaryMin: number;
      salaryMax: number;
      status: JobStatus;
    }>
  ) {
    return prisma.job.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.job.delete({
      where: { id },
    });
  }

  async findByEmployerId(employerId: string) {
    return prisma.job.findMany({
      where: {
        employerId,
        status: {
          not: JobStatus.removed, // don't list completely removed jobs for the employer
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const jobRepository = new JobRepository();
