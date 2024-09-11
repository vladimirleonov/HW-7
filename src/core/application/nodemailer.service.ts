import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/env/configuration';
import { ApiSettings } from '../../settings/env/api-settings';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodemailerService {
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    // console.log('configService initialized', configService);
  }
  async sendEmail(
    recipient: string,
    emailTemplate: string,
    subject: string,
  ): Promise<boolean> {
    console.log('NodemailerService');

    const apiSettings: ApiSettings = this.configService.get('apiSettings', {
      infer: true,
    });

    console.log('NodemailerService apiSettings', apiSettings);

    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      nodemailer.createTransport({
        // TODO: how to add appSettings correctly
        host: apiSettings.EMAIL_HOST,
        port: parseInt(apiSettings.EMAIL_PORT, 10),
        secure: apiSettings.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: apiSettings.EMAIL_USER,
          pass: apiSettings.EMAIL_PASSWORD,
        },
      });

    const info: SMTPTransport.SentMessageInfo = await transporter.sendMail({
      from: apiSettings.EMAIL_USER,
      to: recipient,
      subject: subject,
      html: emailTemplate,
    });

    console.log('Message sent: %s', info.messageId);

    return !!info;
  }
}
