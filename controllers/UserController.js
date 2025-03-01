const Controller = require('./Controller');
const UserModel = require('../models/UserModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

class UserController extends Controller {
    constructor() {
        super();
        this.model = new UserModel();
        this.user = null;
        this.annees = [];
        this.modif = {};
    }

    generateToken(user) {
        return jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    async login(req, res) {
        try {
            const { matricule, password } = req.body;

            // Vérifier l'utilisateur
            const user = await this.model.findUserByMatricule(matricule, password);
            if (!user) {
                return this.unauthorized(res, 'Email ou mot de passe incorrect');
            }

            // Vérifier le mot de passe
            const validPassword = await this.model.verifyPassword(password, user.mdp);
            if (!validPassword) {
                return this.unauthorized(res, 'Email ou mot de passe incorrect');
            }

            // Vérifier les autorisations jury
            const jurys = await this.model.findUserJurys(user.id);
            if (!jurys.length) {
                return this.forbidden(res, 'Vous n\'avez pas accès aux sessions de jury');
            }

            // Préparer la réponse
            delete user.mdp;
            const token = this.generateToken({userId: user.id, email: user.e_mail, role: "jury"});
            this.user = user;
            this.annees = jurys;

            return this.success(res, {
                user: this.user,
                jurys: this.annees,
                token
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async checkUser(req, res) {
        try {
            const { email } = req.body;
            const user = await this.model.findByEmail(email);
            
            if (!user) {
                return this.notFound(res, 'Utilisateur non trouvé');
            }

            delete user.password;
            return this.success(res, user);
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    generatePassword() {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];

        }

        return password;
    }

    async sendMail(to, subject, html) {

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true, // Changé de true à false
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // Ajout de cette option
            }
        });

        return await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html
        });
    }

    async recovery(req, res) {
        try {
            const { email } = req.body;
            const user = await this.model.findByEmail(email);
            
            if (!user) {
                return this.notFound(res, 'Utilisateur non trouvé');
            }

            const newPassword = this.generatePassword();

            await this.model.updatePassword(user.id, newPassword);

            const mailHtml = `
                <h1>Récupération de mot de passe</h1>
                <p>Votre nouveau mot de passe est : <strong>${newPassword}</strong></p>
                <p>Veuillez le changer après votre prochaine connexion.</p>
            `;

            await this.sendMail(
                email,
                'Récupération de mot de passe - Jury INBTP',
                mailHtml
            );

            return this.success(res, null, 'Un nouveau mot de passe a été envoyé par email');
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async changeUserInfo(req, res) {
        try {
            const { userId } = req.params;
            const userInfo = req.body;

            const result = await this.model.updateUserInfo(userId, userInfo);
            if (!result.status) {
                return this.notFound(res, 'Utilisateur non trouvé');
            }

            return this.success(res, null, 'Informations mises à jour avec succès');
        } catch (error) {
            return this.error(res, error.message);
        }
    }
}

module.exports = UserController;