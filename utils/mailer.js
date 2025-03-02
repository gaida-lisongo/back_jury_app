const nodemailer = require('nodemailer');

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendCoteModification(data) {
        const { etudiant, matiere, oldValue, newValue, agent, type, justification } = data;
        
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: 'inbtpkinshasa@gmail.com',
            subject: 'Modification de note - INBTP Jury',
            html: `
                <h2>Modification de note</h2>
                <p><strong>Étudiant:</strong> ${etudiant}</p>
                <p><strong>Matière:</strong> ${matiere}</p>
                <p><strong>Type de note:</strong> ${type}</p>
                <p><strong>Ancienne valeur:</strong> ${oldValue}</p>
                <p><strong>Nouvelle valeur:</strong> ${newValue}</p>
                <p><strong>Modifié par:</strong> ${agent}</p>
                <p><strong>Justification:</strong> ${justification}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        return await this.transporter.sendMail(mailOptions);
    }
}

module.exports = new Mailer();