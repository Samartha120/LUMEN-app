import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.initEthereal();
  }

  private async initEthereal() {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    this.logger.log(`Ethereal email configured. User: ${testAccount.user}`);
  }

  async sendOtpEmail(to: string, otp: string) {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 64px; height: 64px; background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 32px; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
            <strong style="color: #38bdf8; font-size: 24px;">L</strong>
          </div>
          <h1 style="color: #0f172a; margin-top: 16px; font-size: 24px; font-weight: 700;">Welcome to LUMEN</h1>
        </div>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 24px; text-align: center;">
          To securely verify your account, please use the following one-time password (OTP). 
        </p>

        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #ffffff;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 32px;">
          This code will expire in <strong>5 minutes</strong>.<br />
          If you did not request this, please ignore this email.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px;">
            LUMEN Intelligent Civic Infrastructure Platform<br />
            Secure Government Communications
          </p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"LUMEN Security" <noreply@lumen.gov>',
        to,
        subject: 'LUMEN - Verify your account (OTP)',
        html: htmlTemplate,
      });

      this.logger.log(`OTP Email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw error;
    }
  }
}
