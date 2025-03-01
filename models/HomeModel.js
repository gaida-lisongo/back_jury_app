const BaseModel = require('./Model');

class HomeModel extends BaseModel {
    constructor() {
        super('home');
    }

    async getDashboardStats() {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM agent) as totalUsers,
                (SELECT COUNT(*) FROM promotion) as totalPromotions,
                (SELECT COUNT(*) FROM etudiant) as totalStudents,
                (SELECT COUNT(*) FROM matiere) as totalCourses
        `;
        return await this.read(sql);
    }

    async getAnneesAcad(){
        const sql = `
            SELECT * FROM annee
        `;
        return await this.read(sql);
    }

    async getRecentActivities(limit = 5) {
        const sql = `
            SELECT 
                a.id_fiche_cotation,
                f.id_matiere,
                CONCAT(an.debut, ' - ', an.fin) as "annee_acad",
                a.description,
                a.date_insert AS "created_at",
                a.cote AS "action_type",
                CONCAT(u.nom, ' ', u.post_nom, ' ', u.prenom) as "agent_nom",
                u.matricule AS "agent_mat",
                CONCAT(e.nom, ' ', e.post_nom, ' ', e.prenom) as "etudiant_nom",
                e.matricule AS "etudiant_mat",
                a.last_val,
                m.designation AS "matiere",
                m.credit,
                m.semestre,
                m.statut
            FROM insertion a
            INNER JOIN agent u ON a.id_agent = u.id
            INNER JOIN fiche_cotation f ON a.id_fiche_cotation = f.id
            INNER JOIN etudiant e ON f.id_etudiant = e.id
            INNER JOIN matiere m ON f.id_matiere = m.id
            INNER JOIN annee an ON f.id_annee = an.id
            ORDER BY a.date_insert DESC
        `;
        return await this.read(sql, [limit]);
    }
}

module.exports = HomeModel;