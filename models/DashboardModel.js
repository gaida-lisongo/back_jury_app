const UserModelModel = require('./UserModel');

class DashboardModel extends UserModelModel {
    constructor() {
        super('dashboard');
    }

    async getStudentsByPromotion(promotionId, anneeId) {
        const sql = `
            SELECT e.*, CONCAT(nv.intitule, ' ', s.sigle ) as promotion, p.orientation
            FROM etudiant e
            INNER JOIN administratif_etudiant ade ON ade.id_etudiant = e.id
            INNER JOIN promotion_etudiant pe ON pe.id_adminEtudiant = ade.id
            INNER JOIN promotion p ON pe.id_promotion = p.id
            INNER JOIN section s ON s.id = p.id_section
            INNER JOIN niveau nv ON nv.id = p.id_niveau
            WHERE pe.id_promotion = ?
            AND pe.id_annee_acad = ?
        `;
        return await this.read(sql, [promotionId, anneeId]);
    }

    async getCoursesByPromotion(promotionId) {
        const sql = `
            SELECT c.*, u.designation, u.code, u.id_promotion
            FROM matiere c
            INNER JOIN unite u ON u.id = c.id_unite
            WHERE u.id_promotion = ?
        `;
        return await this.read(sql, [promotionId]);
    }

    async getStudentGrades(studentId, courseId) {
        const sql = `
            SELECT *
            FROM fiche_cotation f
            WHERE f.id_etudiant = ? AND f.id_matiere = ?
        `;
        return await this.read(sql, [studentId, courseId]);
    }

    async getRecoursDistribution(promotionId) {
        const sql = `
            SSELECT c.designation as cours, COUNT(cr.id) AS total_recours, u.code
            FROM matiere c
            INNER JOIN unite u ON u.id = c.id_unite
            LEFT JOIN commande_recours cr ON cr.id_matiere = c.id
            WHERE u.id_promotion = ?
            GROUP BY c.id
            ORDER BY total_recours DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async getBestStudent(anneeId) {
        const sql = `            
            SELECT cotes.id, cotes.nom, cotes.post_nom, cotes.prenom, cotes.matricule, SUM(cotes.total_pond) AS note, SUM(cotes.ncnv) AS ncnv
            FROM (SELECT 
                e.*,
                n.code,
                m.designation,
                m.credit,
                CASE 
                    WHEN (COALESCE(note.tp, 0) + COALESCE(note.td, 0) + COALESCE(note.examen, 0)) < COALESCE(note.rattrapage, 0) 
                    THEN COALESCE(note.rattrapage, 0)
                    ELSE (COALESCE(note.tp, 0) + COALESCE(note.td, 0) + COALESCE(note.examen, 0))
                END as total,
                m.credit * (
                    CASE 
                        WHEN (COALESCE(note.tp, 0) + COALESCE(note.td, 0) + COALESCE(note.examen, 0)) < COALESCE(note.rattrapage, 0)
                        THEN COALESCE(note.rattrapage, 0)
                        ELSE (COALESCE(note.tp, 0) + COALESCE(note.td, 0) + COALESCE(note.examen, 0))
                    END
                ) as total_pond,
                CASE 
                    WHEN (
                        CASE 
                            WHEN (COALESCE(note.tp, 0) + COALESCE(note.td, 0) + COALESCE(note.examen, 0)) < COALESCE(note.rattrapage, 0) 
                            THEN COALESCE(note.rattrapage, 0)
                            ELSE (COALESCE(note.tp, 0) + COALESCE(note.td, 0) + COALESCE(note.examen, 0))
                        END
                    ) < 10 THEN m.credit
                    ELSE 0
                END as ncnv,
                COALESCE(note.tp, 0) as tp,
                COALESCE(note.td, 0) as td,
                COALESCE(note.examen, 0) as examen,
                COALESCE(note.rattrapage, 0) as rattrapage
            FROM etudiant e
            INNER JOIN fiche_cotation note ON note.id_etudiant = e.id
            INNER JOIN matiere m ON m.id = note.id_matiere
            INNER JOIN unite n ON n.id = m.id_unite
            WHERE note.id_annee = 3 AND n.id_promotion = 3
            ORDER BY total_pond DESC) AS cotes
            GROUP BY cotes.id;

        `;
        return await this.read(sql, [anneeId]);
    }

    async getValidationSheetsStats(promotionId) {
        const sql = `
            SELECT c.*, f.designation, f.type, SUM(f.montant) AS ca
            FROM commande_validation c
            INNER JOIN fiche_validation f
            WHERE f.id_promotion = ?
            GROUP BY f.type
        `;
        return await this.read(sql, [promotionId]);
    }
}

module.exports = DashboardModel;