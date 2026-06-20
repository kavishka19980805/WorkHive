import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { jobController } from '../controllers/JobController';
import { applicationController } from '../controllers/ApplicationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

// --- Auth Routes (Public) ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Job Routes (Public & Protected) ---
router.get('/jobs', jobController.list);
router.get('/jobs/:id', jobController.getById);

// Employer Jobs
router.post(
  '/jobs',
  authMiddleware as any,
  rbacMiddleware(['employer']),
  jobController.create as any
);
router.get(
  '/employer/jobs',
  authMiddleware as any,
  rbacMiddleware(['employer']),
  jobController.listEmployerJobs as any
);

// --- Application Routes ---

// Seeker Applications
router.post(
  '/applications',
  authMiddleware as any,
  rbacMiddleware(['seeker']),
  applicationController.apply as any
);
router.get(
  '/applications/mine',
  authMiddleware as any,
  rbacMiddleware(['seeker']),
  applicationController.getMine as any
);
router.post(
  '/resume/upload',
  authMiddleware as any,
  rbacMiddleware(['seeker']),
  uploadMiddleware.single('resume'),
  applicationController.uploadResume as any
);

// Employer Manage Applications
router.get(
  '/jobs/:jobId/applicants',
  authMiddleware as any,
  rbacMiddleware(['employer']),
  applicationController.getApplicants as any
);
router.patch(
  '/applications/:id/status',
  authMiddleware as any,
  rbacMiddleware(['employer']),
  applicationController.updateStatus as any
);

// --- Admin Routes ---
router.patch(
  '/admin/jobs/:id/flag',
  authMiddleware as any,
  rbacMiddleware(['admin']),
  jobController.flag as any
);
router.delete(
  '/admin/jobs/:id',
  authMiddleware as any,
  rbacMiddleware(['admin']),
  jobController.remove as any
);

// --- Notifications (Extra Utility) ---
router.get(
  '/notifications',
  authMiddleware as any,
  applicationController.getNotifications as any
);

export default router;
