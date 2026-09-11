import nodemailer from "nodemailer";

interface SendOtpResult {
  success: boolean;
  previewUrl?: string;
  devMode?: boolean;
}

let transporter: any = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
    console.log("📧 Email service configured with SMTP host:", host);
  }

  return transporter;
}

export async function sendOtpEmail(toEmail: string, otp: string): Promise<SendOtpResult> {
  const mailTransporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"EcoTrack Security" <no-reply@ecotrack.local>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EcoTrack Password Reset OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e4e4e7; }
        .header { background: #09090b; padding: 28px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #10b981; }
        .body { padding: 32px 28px; text-align: center; color: #27272a; }
        .body h2 { margin-top: 0; font-size: 20px; font-weight: 600; }
        .body p { font-size: 14px; line-height: 1.6; color: #71717a; margin: 12px 0 24px; }
        .otp-box { background: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 18px 24px; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #047857; display: inline-block; margin: 8px 0 24px; user-select: all; }
        .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; margin-bottom: 24px; }
        .footer { background: #fafafa; padding: 20px 28px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 EcoTrack</h1>
        </div>
        <div class="body">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your EcoTrack account password. Use the verification code below to complete the process:</p>
          <div class="otp-box">${otp}</div>
          <br>
          <div class="badge">⏱ Valid for 10 minutes</div>
          <p style="font-size: 13px; color: #a1a1aa; margin-top: 16px;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EcoTrack Corp. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  // Prominent terminal logging so developers / testers always see the OTP immediately
  console.log("\n=======================================================");
  console.log("🔑 [ECOTRACK PASSWORD RESET OTP]");
  console.log(`   Recipient: ${toEmail}`);
  console.log(`   OTP Code:  >>> ${otp} <<<`);
  console.log("   Validity:  10 minutes");
  console.log("=======================================================\n");

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Your EcoTrack Verification Code: ${otp}`,
        text: `Your EcoTrack verification code is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent,
      });

      console.log(`✅ Reset OTP email dispatched to ${toEmail} (MessageId: ${info.messageId})`);
      return { success: true };
    } catch (err) {
      console.error("⚠️ Failed to dispatch email via SMTP, falling back to local terminal code:", err);
      return { success: true, devMode: true };
    }
  }

  // Development mode without SMTP credentials
  return { success: true, devMode: true };
}
