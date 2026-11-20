import nodemailer from 'nodemailer';

let transporter;

export function getEmailTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) {
    throw new Error('SMTP_USER and SMTP_APP_PASSWORD are required');
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_APP_PASSWORD
      }
    });
  }
  return transporter;
}

export async function sendOtpEmail(email, otp, purpose) {
  const isReset = purpose === 'reset';
  const subject = isReset ? 'Reset your PRERNA password' : 'Verify your PRERNA account';
  const action = isReset ? 'reset your password' : 'verify your email address';
  await getEmailTransporter().sendMail({
    from: process.env.SMTP_FROM || `"PRERNA Community" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    text: `Your PRERNA verification code is ${otp}. It expires in 10 minutes. Use it to ${action}.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;border:1px solid #ece7f4;border-radius:14px"><h2 style="color:#5425a6">PRERNA</h2><p>Use this code to ${action}:</p><div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#5425a6;padding:18px 0">${otp}</div><p style="color:#716d7c;font-size:13px">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`
  });
}
