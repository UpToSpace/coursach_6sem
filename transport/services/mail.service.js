const nodeMailer = require('nodemailer');
const config = require('config');

class MailService {
    constructor() {
        this.transporter = nodeMailer.createTransport({
            host: config.get('smtpHost'),
            port: config.get('smtpPort'),
            secure: config.get('smtpSecure'),
            auth: {
                user: config.get('smtpUser'),
                pass: config.get('smtpPassword')
            }
        });
    }
    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: config.get('smtpUser'),
            to,
            subject: `Активация аккаунта на ${config.get('baseUrl')}`,
            text: '',
            html:
                `
                <div>
                    <h1>Для активации перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
                `
        });
    }
    async sendResetMail(to, link) {
        await this.transporter.sendMail({
            from: config.get('smtpUser'),
            to,
            subject: `Сброс пароля на ${config.get('baseUrl')}`,
            text: '',
            html:
                `
                <div>
                    <h1>Для сброса пароля перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                    <p>Если вы не запрашивали сброс пароля, то просто проигнорируйте это письмо</p>
                </div>
                `
        });
    }
}

module.exports = new MailService();