"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationRepository = exports.ApplicationRepository = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const client_1 = require("@prisma/client");
class ApplicationRepository {
    async createWithTransaction(data, notificationMessage, employerId) {
        return prisma_1.default.$transaction(async (tx) => {
            // 1. Create application
            const application = await tx.application.create({
                data: {
                    jobId: data.jobId,
                    userId: data.userId,
                    coverLetter: data.coverLetter,
                    resumeUrl: data.resumeUrl,
                    status: client_1.ApplicationStatus.pending,
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
    async findById(id) {
        return prisma_1.default.application.findUnique({
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
    async findBySeekerId(userId) {
        return prisma_1.default.application.findMany({
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
    async findByJobId(jobId) {
        return prisma_1.default.application.findMany({
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
    async updateStatus(id, status) {
        return prisma_1.default.application.update({
            where: { id },
            data: { status },
        });
    }
    async updateResumeText(id, resumeText) {
        return prisma_1.default.application.update({
            where: { id },
            data: { resumeText },
        });
    }
    async findNotificationsByUserId(userId) {
        return prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.ApplicationRepository = ApplicationRepository;
exports.applicationRepository = new ApplicationRepository();
