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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const dotenv = __importStar(require("dotenv"));
const http_1 = require("http");
const socket_1 = require("./socket");
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const routes_1 = __importDefault(require("./routes"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Trust proxy headers from ngrok / reverse proxies (fixes express-rate-limit X-Forwarded-For warning)
app.set('trust proxy', 1);
// Security and utility middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // Allow loading static uploads in frontend
}));
// Dynamic CORS configuration to allow local, Vercel, and ngrok requests
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman or server-to-server)
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.some((allowed) => {
            if (allowed === '*')
                return true;
            return (origin === allowed ||
                origin.endsWith('.vercel.app') ||
                origin.includes('ngrok-free.app'));
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(rateLimiter_1.rateLimiter);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static uploads (resumes)
const uploadsPath = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsPath));
// API routes
app.use('/api/v1', routes_1.default);
// Base route for health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'WorkHive API is running smoothly',
        timestamp: new Date(),
    });
});
// Error handling middleware (must be last)
app.use(errorMiddleware_1.errorMiddleware);
const server = (0, http_1.createServer)(app);
(0, socket_1.initSocket)(server);
server.listen(port, () => {
    console.log(`[Server] WorkHive Backend listening on port ${port}`);
    console.log(`[Server] Serving static files from: ${uploadsPath}`);
});
