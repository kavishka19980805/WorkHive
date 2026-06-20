"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationController = exports.ApplicationController = void 0;
const zod_1 = require("zod");
const ApplicationService_1 = require("../services/ApplicationService");
const applySchema = zod_1.z.object({
    jobId: zod_1.z.string().uuid('Invalid Job ID format'),
    coverLetter: zod_1.z.string().min(10, 'Cover letter must be at least 10 characters'),
    resumeUrl: zod_1.z.string().min(1, 'Resume file is required'),
});
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(['accepted', 'rejected'], {
        errorMap: () => ({ message: "Status must be either 'accepted' or 'rejected'" }),
    }),
});
class ApplicationController {
    async apply(req, res, next) {
        try {
            const userId = req.user.id;
            const seekerEmail = req.user.email;
            const data = applySchema.parse(req.body);
            const application = await ApplicationService_1.applicationService.applyToJob(userId, seekerEmail, data);
            return res.status(201).json({
                success: true,
                data: application,
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
    async getMine(req, res, next) {
        try {
            const seekerId = req.user.id;
            const applications = await ApplicationService_1.applicationService.getSeekerApplications(seekerId);
            return res.status(200).json({
                success: true,
                data: applications,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async getApplicants(req, res, next) {
        try {
            const employerId = req.user.id;
            const jobId = req.params.jobId;
            const applicants = await ApplicationService_1.applicationService.getJobApplicants(jobId, employerId);
            return res.status(200).json({
                success: true,
                data: applicants,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const employerId = req.user.id;
            const applicationId = req.params.id;
            const { status } = statusSchema.parse(req.body);
            const application = await ApplicationService_1.applicationService.updateApplicationStatus(applicationId, employerId, status);
            return res.status(200).json({
                success: true,
                data: application,
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
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const notifications = await ApplicationService_1.applicationService.getNotifications(userId);
            return res.status(200).json({
                success: true,
                data: notifications,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async uploadResume(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'UPLOAD_ERROR',
                        message: 'No file uploaded',
                    },
                });
            }
            // Return the relative URL of the uploaded resume on disk
            // It's saved in uploads/resumes relative to backend root
            const resumeUrl = `/uploads/resumes/${req.file.filename}`;
            return res.status(200).json({
                success: true,
                data: {
                    resumeUrl,
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ApplicationController = ApplicationController;
exports.applicationController = new ApplicationController();
