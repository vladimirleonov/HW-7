import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { appSettings } from '../../src/settings/app-settings';

export class NodemailerService {
  async sendEmail(
    recipient: string,
    emailTemplate: string,
    subject: string,
  ): Promise<boolean> {
    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      nodemailer.createTransport({
        // TODO: how to add appSettings correctly
        host: appSettings.api.EMAIL_HOST,
        port: parseInt(appSettings.api.EMAIL_PORT, 10),
        secure: appSettings.api.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: appSettings.api.EMAIL_USER,
          pass: appSettings.api.EMAIL_PASSWORD,
        },
      });

    const info: SMTPTransport.SentMessageInfo = await transporter.sendMail({
      from: appSettings.api.EMAIL_USER,
      to: recipient,
      subject: subject,
      html: emailTemplate,
    });

    console.log('Message sent: %s', info.messageId);

    return !!info;
  }
}
