"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacMiddleware = void 0;
const AppError_1 = require("../errors/AppError");
const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError_1.AppError(401, 'UNAUTHORIZED', 'Authentication required'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError_1.AppError(403, 'FORBIDDEN', `Access denied. Role '${req.user.role}' does not have permission.`));
        }
        next();
    };
};
exports.rbacMiddleware = rbacMiddleware;
