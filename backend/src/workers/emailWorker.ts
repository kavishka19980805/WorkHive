import { parentPort, workerData } from 'worker_threads';
import * as nodemailer from 'nodemailer';

async function sendEmail() {
  const { to, subject, text, html } = workerData;

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

  if (parentPort) {
    parentPort.postMessage({ success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) });
  }
}

sendEmail().catch((err) => {
  console.error('[Email Worker] Error sending email:', err);
  if (parentPort) {
    parentPort.postMessage({ success: false, error: err.message });
  }
  process.exit(1);
});
