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
exports.authService = exports.AuthService = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const UserRepository_1 = require("../repositories/UserRepository");
const AppError_1 = require("../errors/AppError");
class AuthService {
    async register(email, passwordPlain, role) {
        const existing = await UserRepository_1.userRepository.findByEmail(email);
        if (existing) {
            throw new AppError_1.AppError(400, 'EMAIL_EXISTS', 'A user with this email already exists');
        }
        const passwordHash = await bcrypt.hash(passwordPlain, 10);
        const user = await UserRepository_1.userRepository.create(email, passwordHash, role);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
    async login(email, passwordPlain) {
        const user = await UserRepository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new AppError_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
        if (!isMatch) {
            throw new AppError_1.AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }
        const jwtSecret = process.env.JWT_SECRET || 'super_secret_workhive_jwt_token_key_123456!';
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, jwtSecret, { expiresIn: '7d' });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
