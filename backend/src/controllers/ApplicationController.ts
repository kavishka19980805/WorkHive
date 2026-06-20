import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { applicationService } from '../services/ApplicationService';
import { AuthenticatedRequest } from '../types';

const applySchema = z.object({
  jobId: z.string().uuid('Invalid Job ID format'),
  coverLetter: z.string().min(10, 'Cover letter must be at least 10 characters'),
  resumeUrl: z.string().min(1, 'Resume file is required'),
});

const statusSchema = z.object({
  status: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: "Status must be either 'accepted' or 'rejected'" }),
  }),
});

export class ApplicationController {
  async apply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const seekerEmail = req.user!.email;
      const data = applySchema.parse(req.body);

      const application = await applicationService.applyToJob(userId, seekerEmail, data);

      return res.status(201).json({
        success: true,
        data: application,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
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

  async getMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const seekerId = req.user!.id;
      const applications = await applicationService.getSeekerApplications(seekerId);

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (err) {
      next(err);
    }
  }

  async getApplicants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const jobId = req.params.jobId;

      const applicants = await applicationService.getJobApplicants(jobId, employerId);

      return res.status(200).json({
        success: true,
        data: applicants,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const applicationId = req.params.id;
      const { status } = statusSchema.parse(req.body);

      const application = await applicationService.updateApplicationStatus(
        applicationId,
        employerId,
        status
      );

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
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

  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await applicationService.getNotifications(userId);

      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
    } catch (err) {
      next(err);
    }
  }
}

export const applicationController = new ApplicationController();
