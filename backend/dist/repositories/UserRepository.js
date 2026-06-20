"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const prisma_1 = __importDefault(require("./prisma"));
class UserRepository {
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return prisma_1.default.user.findUnique({
            where: { id },
        });
    }
    async create(email, passwordHash, role) {
        return prisma_1.default.user.create({
            data: {
                email,
                passwordHash,
                role,
            },
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
