import { jobRepository } from '../repositories/JobRepository';
import { AppError } from '../errors/AppError';

export class JobService {
  async createJob(
    employerId: string,
    data: {
      title: string;
      description: string;
      location: string;
      category: string;
      salaryMin: number;
      salaryMax: number;
    }
  ) {
    if (data.salaryMin > data.salaryMax) {
      throw new AppError(400, 'INVALID_SALARY_RANGE', 'Minimum salary cannot exceed maximum salary');
    }

    return jobRepository.create({
      employerId,
      ...data,
    });
  }

  async getJobById(id: string) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
    }
    return job;
  }

  async listJobs(filters: {
    category?: string;
    location?: string;
    minSalary?: string;
    maxSalary?: string;
    search?: string;
    status?: string;
  }) {
    const minSalaryNum = filters.minSalary ? parseInt(filters.minSalary, 10) : undefined;
    const maxSalaryNum = filters.maxSalary ? parseInt(filters.maxSalary, 10) : undefined;

    return jobRepository.findAll({
      category: filters.category,
      location: filters.location,
      minSalary: isNaN(minSalaryNum as any) ? undefined : minSalaryNum,
      maxSalary: isNaN(maxSalaryNum as any) ? undefined : maxSalaryNum,
      search: filters.search,
      status: filters.status as any,
    });
  }

  async flagJob(id: string) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
    }

    return jobRepository.update(id, { status: 'flagged' as any });
  }

  async removeJob(id: string) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', 'Job posting not found');
    }

    // Soft delete or hard delete? The assessment says "Remove a job permanently" for DELETE /api/v1/admin/jobs/:id.
    // Let's perform a hard delete or update status to removed.
    // "DELETE /api/v1/admin/jobs/:id - Remove a job permanently"
    return jobRepository.delete(id);
  }

  async getEmployerJobs(employerId: string) {
    return jobRepository.findByEmployerId(employerId);
  }
}

export const jobService = new JobService();
