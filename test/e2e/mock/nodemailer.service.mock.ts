export class NodemailerServiceMock {
  async sendEmail(
    recipient: string,
    emailTemplate: string,
    subject: string,
  ): Promise<boolean> {
    console.log('Call mock method sendEmail / NodemailerServiceMock');
    return Promise.resolve(true);
  }
}
