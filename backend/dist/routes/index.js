"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const JobController_1 = require("../controllers/JobController");
const ApplicationController_1 = require("../controllers/ApplicationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = (0, express_1.Router)();
// --- Auth Routes (Public) ---
router.post('/auth/register', AuthController_1.authController.register);
router.post('/auth/login', AuthController_1.authController.login);
// --- Job Routes (Public & Protected) ---
router.get('/jobs', JobController_1.jobController.list);
router.get('/jobs/:id', JobController_1.jobController.getById);
// Employer Jobs
router.post('/jobs', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['employer']), JobController_1.jobController.create);
router.get('/employer/jobs', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['employer']), JobController_1.jobController.listEmployerJobs);
// --- Application Routes ---
// Seeker Applications
router.post('/applications', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['seeker']), ApplicationController_1.applicationController.apply);
router.get('/applications/mine', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['seeker']), ApplicationController_1.applicationController.getMine);
router.post('/resume/upload', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['seeker']), uploadMiddleware_1.uploadMiddleware.single('resume'), ApplicationController_1.applicationController.uploadResume);
// Employer Manage Applications
router.get('/jobs/:jobId/applicants', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['employer']), ApplicationController_1.applicationController.getApplicants);
router.patch('/applications/:id/status', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['employer']), ApplicationController_1.applicationController.updateStatus);
// --- Admin Routes ---
router.patch('/admin/jobs/:id/flag', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['admin']), JobController_1.jobController.flag);
router.delete('/admin/jobs/:id', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.rbacMiddleware)(['admin']), JobController_1.jobController.remove);
// --- Notifications (Extra Utility) ---
router.get('/notifications', authMiddleware_1.authMiddleware, ApplicationController_1.applicationController.getNotifications);
router.patch('/notifications/:id/read', authMiddleware_1.authMiddleware, ApplicationController_1.applicationController.markNotificationAsRead);
exports.default = router;
