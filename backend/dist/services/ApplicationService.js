"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationService = exports.ApplicationService = void 0;
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
const ApplicationRepository_1 = require("../repositories/ApplicationRepository");
const JobRepository_1 = require("../repositories/JobRepository");
const AppError_1 = require("../errors/AppError");
const socket_1 = require("../socket");
const matchEngine_1 = require("./matchEngine");
class ApplicationService {
    // Helper to spawn a worker thread supporting both development (ts-node) and production (dist/js)
    spawnWorker(workerName, workerData) {
        const isTsNode = process.argv.some((arg) => arg.includes('ts-node') || arg.includes('nodemon'));
        const ext = isTsNode ? '.ts' : '.js';
        // Resolve path relative to this file's compiled location
        const workerPath = path.resolve(__dirname, `../workers/${workerName}${ext}`);
        console.log(`[Worker Spawner] Launching ${workerName} from ${workerPath}`);
        const worker = new worker_threads_1.Worker(workerPath, {
            workerData,
            execArgv: isTsNode ? ['-r', 'ts-node/register'] : [],
        });
        worker.on('error', (err) => {
            console.error(`[Worker ${workerName}] Error:`, err);
        });
        worker.on('exit', (code) => {
            console.log(`[Worker ${workerName}] Exited with code ${code}`);
        });
        return worker;
    }
    async applyToJob(userId, seekerEmail, data) {
        const job = await JobRepository_1.jobRepository.findById(data.jobId);
        if (!job) {
            throw new AppError_1.AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
        }
        if (job.status !== 'active') {
            throw new AppError_1.AppError(400, 'JOB_INACTIVE', 'This job posting is no longer active');
        }
        // Check if already applied
        const existingApplications = await ApplicationRepository_1.applicationRepository.findBySeekerId(userId);
        const alreadyApplied = existingApplications.some((app) => app.jobId === data.jobId);
        if (alreadyApplied) {
            throw new AppError_1.AppError(400, 'ALREADY_APPLIED', 'You have already applied for this job');
        }
        const notificationMessage = `New application received for '${job.title}' from ${seekerEmail}`;
        // Create application and notification in database transaction
        const application = await ApplicationRepository_1.applicationRepository.createWithTransaction({ ...data, userId }, notificationMessage, job.employerId);
        // Send real-time notification to the employer using Socket.io
        (0, socket_1.sendSocketNotification)(job.employerId, notificationMessage);
        // 1. Spawn Email Worker (Sends confirmation email in background, HTTP returns immediately)
        const emailData = {
            to: seekerEmail,
            subject: `Application Submitted: ${job.title} at ${job.employer.email}`,
            text: `Hi,\n\nYour application for '${job.title}' has been successfully submitted to the employer. We will notify you when they update your application status.\n\nCover Letter: ${data.coverLetter}\n\nBest of luck,\nThe WorkHive Team`,
            html: `<p>Hi,</p><p>Your application for <strong>${job.title}</strong> has been successfully submitted. We will notify you when the employer updates your application status.</p><p><strong>Cover Letter:</strong><br/>${data.coverLetter}</p><p>Best of luck,<br/>The WorkHive Team</p>`,
        };
        this.spawnWorker('emailWorker', emailData);
        // 2. Spawn Resume Parser Worker to extract text and update the database
        // The uploaded PDF is located in the uploads directory
        // E.g., resumeUrl = "/uploads/resumes/resume-xxx.pdf"
        // Let's resolve the absolute path on the backend disk
        const uploadsDir = path.resolve(__dirname, '../../../'); // root of backend
        const pdfPath = path.join(uploadsDir, data.resumeUrl);
        const txtFileName = path.basename(data.resumeUrl, '.pdf') + '.txt';
        const textOutputPath = path.join(uploadsDir, 'uploads', 'resumes', 'parsed-text', txtFileName);
        const parserWorker = this.spawnWorker('resumeParserWorker', {
            filePath: pdfPath,
            textOutputPath,
        });
        parserWorker.on('message', async (message) => {
            if (message.success && message.text) {
                console.log(`[Main Thread] Resume text extracted for application ${application.id}. Updating database...`);
                await ApplicationRepository_1.applicationRepository.updateResumeText(application.id, message.text);
            }
        });
        return application;
    }
    async getSeekerApplications(seekerId) {
        return ApplicationRepository_1.applicationRepository.findBySeekerId(seekerId);
    }
    async getJobApplicants(jobId, employerId) {
        const job = await JobRepository_1.jobRepository.findById(jobId);
        if (!job) {
            throw new AppError_1.AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
        }
        if (job.employerId !== employerId) {
            throw new AppError_1.AppError(403, 'FORBIDDEN', 'Access denied. You do not own this job listing.');
        }
        const applicants = await ApplicationRepository_1.applicationRepository.findByJobId(jobId);
        // Compute similarity match score for each applicant based on job description & resume text
        return applicants.map((app) => {
            const matchResult = (0, matchEngine_1.calculateMatchScore)(job.description, app.resumeText);
            return {
                ...app,
                matchScore: matchResult.matchScore,
                matchedSkills: matchResult.matchedSkills,
                missingSkills: matchResult.missingSkills,
            };
        });
    }
    async updateApplicationStatus(applicationId, employerId, status) {
        const application = await ApplicationRepository_1.applicationRepository.findById(applicationId);
        if (!application) {
            throw new AppError_1.AppError(404, 'APPLICATION_NOT_FOUND', 'Job application not found');
        }
        if (application.job.employerId !== employerId) {
            throw new AppError_1.AppError(403, 'FORBIDDEN', 'Access denied. You do not own this job listing.');
        }
        const updatedApp = await ApplicationRepository_1.applicationRepository.updateStatus(applicationId, status);
        // Optional: Spawn Email Worker to notify the seeker of their status change
        const emailData = {
            to: application.user.email,
            subject: `Application Update: ${application.job.title}`,
            text: `Hi,\n\nYour application status for '${application.job.title}' has been updated to: ${status.toUpperCase()}.\n\nBest,\nThe WorkHive Team`,
            html: `<p>Hi,</p><p>Your application status for <strong>${application.job.title}</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p><p>Best,<br/>The WorkHive Team</p>`,
        };
        this.spawnWorker('emailWorker', emailData);
        return updatedApp;
    }
    async getNotifications(userId) {
        return ApplicationRepository_1.applicationRepository.findNotificationsByUserId(userId);
    }
}
exports.ApplicationService = ApplicationService;
exports.applicationService = new ApplicationService();
