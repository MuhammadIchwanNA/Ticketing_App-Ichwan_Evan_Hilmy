import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
export class MailerHelper {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // email sender
        pass: process.env.EMAIL_PASS, // app password
      },
    });
  }

  public async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.MAILER_EMAIL,
      to,
      subject,
      html,
    });
  }
}
