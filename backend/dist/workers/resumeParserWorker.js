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
const worker_threads_1 = require("worker_threads");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
async function parseResume() {
    const { filePath, textOutputPath } = worker_threads_1.workerData;
    if (!filePath) {
        throw new Error('No PDF file path provided');
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file does not exist at path: ${filePath}`);
    }
    const dataBuffer = fs.readFileSync(filePath);
    // Parse PDF
    const data = await (0, pdf_parse_1.default)(dataBuffer);
    const text = data.text || '';
    // Write plain text copy
    if (textOutputPath) {
        // Ensure parent directory exists
        const dir = path.dirname(textOutputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(textOutputPath, text, 'utf-8');
        console.log(`[Resume Worker] Text copy written to: ${textOutputPath}`);
    }
    console.log(`[Resume Worker] PDF parsed successfully, characters: ${text.length}`);
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage({ success: true, text });
    }
}
parseResume().catch((err) => {
    console.error('[Resume Worker] Error parsing resume:', err);
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage({ success: false, error: err.message });
    }
    process.exit(1);
});
