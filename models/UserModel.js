const Model = require('./Model');
const bcrypt = require('bcrypt');

class UserModel extends Model {
    constructor() {
        super('agent');
        this.saltRounds = 10;
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async findByEmail(email) {
        const sql = `
            SELECT * FROM agent 
            WHERE email = ?
            AND statut = 1
        `;
        const users = await this.read(sql, [email]);
        return users[0];
    }

    async findUserJurys(userId) {
        const sql = `
            SELECT DISTINCT
                a.id,
                CONCAT(a.debut, ' - ', a.fin) as annee_acad,
                j.id as jury_id,
                j.designation as jury_nom,
                j.date_debut,
                j.date_fin,
                j.statut
            FROM annee a
            INNER JOIN jury j ON j.id_annee = a.id
            INNER JOIN jury_agent ja ON ja.id_jury = j.id
            WHERE ja.id_agent = ?
            ORDER BY a.debut DESC
        `;
        return await this.read(sql, [userId]);
    }

    async updatePassword(userId, password) {
        const hashedPassword = await this.hashPassword(password);
        const sql = `
            UPDATE agent 
            SET password = ?, 
                updated_at = NOW() 
            WHERE id = ?
        `;
        return await this.update(sql, [hashedPassword, userId]);
    }

    async updateUserInfo(userId, userInfo) {
        // Si le mot de passe est inclus dans userInfo, le hasher
        if (userInfo.password) {
            userInfo.password = await this.hashPassword(userInfo.password);
        }
        
        const sql = `
            UPDATE agent 
            SET ? 
            WHERE id = ?
        `;
        return await this.update(sql, [userInfo, userId]);
    }
}

module.exports = UserModel;