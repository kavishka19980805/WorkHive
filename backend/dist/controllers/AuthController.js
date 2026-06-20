"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const zod_1 = require("zod");
const AuthService_1 = require("../services/AuthService");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    role: zod_1.z.enum(['seeker', 'employer', 'admin'], {
        errorMap: () => ({ message: "Role must be 'seeker', 'employer', or 'admin'" }),
    }),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password, role } = registerSchema.parse(req.body);
            const user = await AuthService_1.authService.register(email, password, role);
            return res.status(201).json({
                success: true,
                data: user,
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
    async login(req, res, next) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const data = await AuthService_1.authService.login(email, password);
            return res.status(200).json({
                success: true,
                data,
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
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
