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
const worker_threads_1 = require("worker_threads");
const nodemailer = __importStar(require("nodemailer"));
async function sendEmail() {
    const { to, subject, text, html } = worker_threads_1.workerData;
    if (!to) {
        throw new Error('No recipient email provided');
    }
    // Create an Ethereal SMTP test account automatically
    const testAccount = await nodemailer.createTestAccount();
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
    // Send mail
    const info = await transporter.sendMail({
        from: '"WorkHive Notification" <no-reply@workhive.com>',
        to,
        subject,
        text,
        html,
    });
    console.log(`[Email Worker] Email sent successfully to ${to}`);
    console.log(`[Email Worker] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage({ success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) });
    }
}
sendEmail().catch((err) => {
    console.error('[Email Worker] Error sending email:', err);
    if (worker_threads_1.parentPort) {
        worker_threads_1.parentPort.postMessage({ success: false, error: err.message });
    }
    process.exit(1);
});
