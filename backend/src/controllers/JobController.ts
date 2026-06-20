import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { jobService } from '../services/JobService';
import { AuthenticatedRequest } from '../types';

const createJobSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  salaryMin: z.number().int().nonnegative('Minimum salary must be non-negative'),
  salaryMax: z.number().int().nonnegative('Maximum salary must be non-negative'),
});

export class JobController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const jobData = createJobSchema.parse(req.body);
      const job = await jobService.createJob(employerId, jobData);

      return res.status(201).json({
        success: true,
        data: job,
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

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const job = await jobService.getJobById(id);

      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        location: req.query.location as string,
        minSalary: req.query.minSalary as string,
        maxSalary: req.query.maxSalary as string,
        search: req.query.search as string,
        status: req.query.status as string,
      };

      const jobs = await jobService.listJobs(filters);

      return res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (err) {
      next(err);
    }
  }

  async flag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const job = await jobService.flagJob(id);

      return res.status(200).json({
        success: true,
        data: job,
      });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await jobService.removeJob(id);

      return res.status(200).json({
        success: true,
        message: 'Job posting deleted permanently',
      });
    } catch (err) {
      next(err);
    }
  }

  async listEmployerJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.user!.id;
      const jobs = await jobService.getEmployerJobs(employerId);

      return res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const jobController = new JobController();
