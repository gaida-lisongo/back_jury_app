const UserModelModel = require('./UserModel');

class DashboardModel extends UserModelModel {
    constructor() {
        super('dashboard');
    }

    async getStudentsByPromotion(promotionId, anneeId) {
        const sql = `
            SELECT e.*, p.designation as promotion
            FROM etudiant e
            JOIN promotion p ON e.id_promotion = p.id
            WHERE e.id_promotion = ? 
            AND e.id_annee = ?
        `;
        return await this.read(sql, [promotionId, anneeId]);
    }

    async getCoursesByPromotion(promotionId) {
        const sql = `
            SELECT c.*, p.designation as promotion
            FROM cours c
            JOIN promotion p ON c.id_promotion = p.id
            WHERE c.id_promotion = ?
        `;
        return await this.read(sql, [promotionId]);
    }

    async getStudentGrades(studentId, courseId) {
        const sql = `
            SELECT n.* 
            FROM note n
            WHERE n.id_etudiant = ? 
            AND n.id_cours = ?
        `;
        return await this.read(sql, [studentId, courseId]);
    }

    async getRecoursDistribution(promotionId) {
        const sql = `
            SELECT 
                c.designation as cours,
                COUNT(cr.id) as total_recours
            FROM cours c
            LEFT JOIN commande_recours cr ON cr.id_cours = c.id
            WHERE c.id_promotion = ?
            GROUP BY c.id
            ORDER BY total_recours DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async getBestStudent(anneeId) {
        const sql = `
            SELECT 
                e.*, 
                p.designation as promotion,
                AVG(n.note) as moyenne
            FROM etudiant e
            JOIN promotion p ON e.id_promotion = p.id
            JOIN note n ON n.id_etudiant = e.id
            WHERE e.id_annee = ?
            GROUP BY e.id
            ORDER BY moyenne DESC
            LIMIT 1
        `;
        return await this.read(sql, [anneeId]);
    }

    async getValidationSheetsStats(anneeId) {
        const sql = `
            SELECT 
                type_validation,
                COUNT(*) as total
            FROM fiche_validation
            WHERE id_annee = ?
            GROUP BY type_validation
        `;
        return await this.read(sql, [anneeId]);
    }
}

module.exports = DashboardModel;