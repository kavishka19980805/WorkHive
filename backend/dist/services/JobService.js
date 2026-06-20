"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobService = exports.JobService = void 0;
const JobRepository_1 = require("../repositories/JobRepository");
const AppError_1 = require("../errors/AppError");
class JobService {
    async createJob(employerId, data) {
        if (data.salaryMin > data.salaryMax) {
            throw new AppError_1.AppError(400, 'INVALID_SALARY_RANGE', 'Minimum salary cannot exceed maximum salary');
        }
        return JobRepository_1.jobRepository.create({
            employerId,
            ...data,
        });
    }
    async getJobById(id) {
        const job = await JobRepository_1.jobRepository.findById(id);
        if (!job) {
            throw new AppError_1.AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
        }
        return job;
    }
    async listJobs(filters) {
        const minSalaryNum = filters.minSalary ? parseInt(filters.minSalary, 10) : undefined;
        const maxSalaryNum = filters.maxSalary ? parseInt(filters.maxSalary, 10) : undefined;
        return JobRepository_1.jobRepository.findAll({
            category: filters.category,
            location: filters.location,
            minSalary: isNaN(minSalaryNum) ? undefined : minSalaryNum,
            maxSalary: isNaN(maxSalaryNum) ? undefined : maxSalaryNum,
            search: filters.search,
            status: filters.status,
        });
    }
    async flagJob(id) {
        const job = await JobRepository_1.jobRepository.findById(id);
        if (!job) {
            throw new AppError_1.AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
        }
        return JobRepository_1.jobRepository.update(id, { status: 'flagged' });
    }
    async removeJob(id) {
        const job = await JobRepository_1.jobRepository.findById(id);
        if (!job) {
            throw new AppError_1.AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
        }
        // Soft delete or hard delete? The assessment says "Remove a job permanently" for DELETE /api/v1/admin/jobs/:id.
        // Let's perform a hard delete or update status to removed.
        // "DELETE /api/v1/admin/jobs/:id - Remove a job permanently"
        return JobRepository_1.jobRepository.delete(id);
    }
    async getEmployerJobs(employerId) {
        return JobRepository_1.jobRepository.findByEmployerId(employerId);
    }
}
exports.JobService = JobService;
exports.jobService = new JobService();
