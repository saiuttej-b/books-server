import { Injectable } from '@nestjs/common';
import { EmailBodyProps, EmailService } from '@saiuttej/nestjs-mailer';
import { compile } from 'handlebars';
import { readFile } from 'node:fs/promises';

export type SendEmailProps = EmailBodyProps;

@Injectable()
export class AppMailerService {
  constructor(private readonly emailService: EmailService) {}

  async generateHtmlFromTemplate(props: { templatePath: string; values: Record<string, unknown> }) {
    const { templatePath, values } = props;
    const fileContent = await readFile(templatePath, 'utf-8');
    const compiledTemplate = compile(fileContent);
    const html = compiledTemplate(values);
    return html;
  }

  async sendEmail(props: SendEmailProps) {
    await this.emailService.send({ emailData: props });
  }
}
