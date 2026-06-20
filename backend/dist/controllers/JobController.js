"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobController = exports.JobController = void 0;
const zod_1 = require("zod");
const JobService_1 = require("../services/JobService");
const createJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    location: zod_1.z.string().min(2, 'Location must be at least 2 characters'),
    category: zod_1.z.string().min(2, 'Category must be at least 2 characters'),
    salaryMin: zod_1.z.number().int().nonnegative('Minimum salary must be non-negative'),
    salaryMax: zod_1.z.number().int().nonnegative('Maximum salary must be non-negative'),
});
class JobController {
    async create(req, res, next) {
        try {
            const employerId = req.user.id;
            const jobData = createJobSchema.parse(req.body);
            const job = await JobService_1.jobService.createJob(employerId, jobData);
            return res.status(201).json({
                success: true,
                data: job,
            });
        }
        catch (err) {
            if (err instanceof zod_1.z.ZodError) {
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
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const job = await JobService_1.jobService.getJobById(id);
            return res.status(200).json({
                success: true,
                data: job,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async list(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                location: req.query.location,
                minSalary: req.query.minSalary,
                maxSalary: req.query.maxSalary,
                search: req.query.search,
                status: req.query.status,
            };
            const jobs = await JobService_1.jobService.listJobs(filters);
            return res.status(200).json({
                success: true,
                data: jobs,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async flag(req, res, next) {
        try {
            const { id } = req.params;
            const job = await JobService_1.jobService.flagJob(id);
            return res.status(200).json({
                success: true,
                data: job,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await JobService_1.jobService.removeJob(id);
            return res.status(200).json({
                success: true,
                message: 'Job posting deleted permanently',
            });
        }
        catch (err) {
            next(err);
        }
    }
    async listEmployerJobs(req, res, next) {
        try {
            const employerId = req.user.id;
            const jobs = await JobService_1.jobService.getEmployerJobs(employerId);
            return res.status(200).json({
                success: true,
                data: jobs,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.JobController = JobController;
exports.jobController = new JobController();
