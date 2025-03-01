const Model = require('./Model');
const bcrypt = require('crypto');

class UserModel extends Model {
    constructor() {
        super('agent');
        this.saltRounds = 10;
    }

    async hashPassword(password) {
        return await bcrypt.createHash('sha256')
        .update(password)
        .digest('hex');
    }

    async verifyPassword(plainPassword, hashedPassword) {
        const hash = await this.hashPassword(plainPassword)
        
        return hash == hashedPassword;
    }

    async findByEmail(email) {
        const sql = `
            SELECT * FROM agent 
            WHERE e_mail = ?
        `;
        const users = await this.read(sql, [email]);
        return users[0];
    }

    async findUserByMatricule(matricule, mdp) {
        const hashedPassword = await this.hashPassword(mdp);
        const sql = `SELECT a.*
            FROM agent a
            INNER JOIN affectation af ON af.id_agent = a.id
            INNER JOIN poste p ON p.id = af.id_poste
            WHERE p.designation = 'JURY' AND matricule = ? AND mdp = ?
        `;
        const users = await this.read(sql, [matricule, hashedPassword]);
  
        return users[0];
    }

    async findUserJurys(userId) {
        const sql = `
            SELECT *
            FROM niveau_jury dj
            INNER JOIN jury j ON dj.id_jury = j.id
            INNER JOIN promotion p ON p.id = dj.id_niveau
            WHERE j.id_president = ? OR j.id_secretaire = ? OR j.id_membre = ?
            GROUP BY dj.id_jury
        `;
        return await this.read(sql, [userId, userId, userId]);
    }

    async updatePassword(userId, password) {
        const hashedPassword = await this.hashPassword(password);
        const sql = `
            UPDATE agent 
            SET mdp = ? 
            WHERE id = ?
        `;
        return await this.update(sql, [hashedPassword, userId]);
    }

    async updateUserInfo(userId, userInfo) {
        // Si le mot de passe est inclus dans userInfo, le hasher
        if (userInfo.mdp) {
            userInfo.mdp = await this.hashPassword(userInfo.mdp);
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