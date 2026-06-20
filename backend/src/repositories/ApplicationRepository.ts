import prisma from './prisma';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationRepository {
  async createWithTransaction(
    data: {
      jobId: string;
      userId: string;
      coverLetter: string;
      resumeUrl: string;
    },
    notificationMessage: string,
    employerId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Create application
      const application = await tx.application.create({
        data: {
          jobId: data.jobId,
          userId: data.userId,
          coverLetter: data.coverLetter,
          resumeUrl: data.resumeUrl,
          status: ApplicationStatus.pending,
        },
        include: {
          job: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      // 2. Create notification for employer
      await tx.notification.create({
        data: {
          userId: employerId,
          message: notificationMessage,
        },
      });

      return application;
    });
  }

  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findBySeekerId(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

  async findByJobId(jobId: string) {
    return prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    return prisma.application.update({
      where: { id },
      data: { status },
    });
  }

  async updateResumeText(id: string, resumeText: string) {
    return prisma.application.update({
      where: { id },
      data: { resumeText },
    });
  }

  async findNotificationsByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const applicationRepository = new ApplicationRepository();
