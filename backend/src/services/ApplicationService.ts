import { Worker } from 'worker_threads';
import * as path from 'path';
import * as fs from 'fs';
import { applicationRepository } from '../repositories/ApplicationRepository';
import { jobRepository } from '../repositories/JobRepository';
import { AppError } from '../errors/AppError';
import { ApplicationStatus } from '@prisma/client';
import { sendSocketNotification } from '../socket';
import { calculateMatchScore } from './matchEngine';

export class ApplicationService {
  // Helper to spawn a worker thread supporting both development (ts-node) and production (dist/js)
  private spawnWorker(workerName: string, workerData: any) {
    const isTsNode = process.argv.some((arg) => arg.includes('ts-node') || arg.includes('nodemon'));
    const ext = isTsNode ? '.ts' : '.js';
    
    // Resolve path relative to this file's compiled location
    const workerPath = path.resolve(__dirname, `../workers/${workerName}${ext}`);

    console.log(`[Worker Spawner] Launching ${workerName} from ${workerPath}`);

    const worker = new Worker(workerPath, {
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

  async applyToJob(
    userId: string,
    seekerEmail: string,
    data: {
      jobId: string;
      coverLetter: string;
      resumeUrl: string;
    }
  ) {
    const job = await jobRepository.findById(data.jobId);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
    }

    if (job.status !== 'active') {
      throw new AppError(400, 'JOB_INACTIVE', 'This job posting is no longer active');
    }

    // Check if already applied
    const existingApplications = await applicationRepository.findBySeekerId(userId);
    const alreadyApplied = existingApplications.some((app) => app.jobId === data.jobId);
    if (alreadyApplied) {
      throw new AppError(400, 'ALREADY_APPLIED', 'You have already applied for this job');
    }

    const notificationMessage = `New application received for '${job.title}' from ${seekerEmail}`;
    
    // Create application and notification in database transaction
    const application = await applicationRepository.createWithTransaction(
      { ...data, userId },
      notificationMessage,
      job.employerId
    );

    // Send real-time notification to the employer using Socket.io
    sendSocketNotification(job.employerId, notificationMessage);

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
        await applicationRepository.updateResumeText(application.id, message.text);
      }
    });

    return application;
  }

  async getSeekerApplications(seekerId: string) {
    return applicationRepository.findBySeekerId(seekerId);
  }

  async getJobApplicants(jobId: string, employerId: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
    }

    if (job.employerId !== employerId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied. You do not own this job listing.');
    }

    const applicants = await applicationRepository.findByJobId(jobId);

    // Compute similarity match score for each applicant based on job description & resume text
    return applicants.map((app) => {
      const matchResult = calculateMatchScore(job.description, app.resumeText);
      return {
        ...app,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
      };
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    employerId: string,
    status: 'accepted' | 'rejected'
  ) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Job application not found');
    }

    if (application.job.employerId !== employerId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied. You do not own this job listing.');
    }

    const updatedApp = await applicationRepository.updateStatus(applicationId, status as any);

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

  async getNotifications(userId: string) {
    return applicationRepository.findNotificationsByUserId(userId);
  }
}

export const applicationService = new ApplicationService();
