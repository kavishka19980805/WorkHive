"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRepository = exports.JobRepository = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const client_1 = require("@prisma/client");
class JobRepository {
    async create(data) {
        return prisma_1.default.job.create({
            data: {
                employerId: data.employerId,
                title: data.title,
                description: data.description,
                location: data.location,
                category: data.category,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                status: client_1.JobStatus.active,
            },
        });
    }
    async findById(id) {
        return prisma_1.default.job.findUnique({
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
    async findAll(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        else {
            // By default, only list active jobs unless specified (e.g. for admin panel)
            where.status = client_1.JobStatus.active;
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
        return prisma_1.default.job.findMany({
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
    async update(id, data) {
        return prisma_1.default.job.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.default.job.delete({
            where: { id },
        });
    }
    async findByEmployerId(employerId) {
        return prisma_1.default.job.findMany({
            where: {
                employerId,
                status: {
                    not: client_1.JobStatus.removed, // don't list completely removed jobs for the employer
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
exports.JobRepository = JobRepository;
exports.jobRepository = new JobRepository();
