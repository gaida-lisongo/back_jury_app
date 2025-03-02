const Model = require('./Model');

class PromotionModel extends Model {
    constructor() {
        super('promotion');
    }

    async getGrillePromotion(anneeId, promotionId, type = 'ANNEE') {
        const sql = `
            SELECT 
                u.id as unite_id,
                u.code as unite_code,
                u.designation as unite_designation,
                m.id as matiere_id,
                m.designation as matiere_designation,
                m.credit,
                e.id as etudiant_id,
                e.nom,
                e.post_nom,
                e.prenom,
                CASE 
                    WHEN (COALESCE(n.tp, 0) + COALESCE(n.td, 0) + COALESCE(n.examen, 0)) < COALESCE(n.rattrapage, 0) 
                    THEN COALESCE(n.rattrapage, 0)
                    ELSE (COALESCE(n.tp, 0) + COALESCE(n.td, 0) + COALESCE(n.examen, 0))
                END as total,
                CASE 
                    WHEN (
                        CASE 
                            WHEN (COALESCE(n.tp, 0) + COALESCE(n.td, 0) + COALESCE(n.examen, 0)) < COALESCE(n.rattrapage, 0) 
                            THEN COALESCE(n.rattrapage, 0)
                            ELSE (COALESCE(n.tp, 0) + COALESCE(n.td, 0) + COALESCE(n.examen, 0))
                        END
                    ) < 10 THEN m.credit
                    ELSE 0
                END as ncnv,
                n.id as note_id,
                n.tp,
                n.td,
                n.examen,
                n.rattrapage
            FROM unite u
            INNER JOIN matiere m ON m.id_unite = u.id
            LEFT JOIN fiche_cotation n ON n.id_matiere = m.id
            INNER JOIN etudiant e ON e.id = n.id_etudiant
            WHERE n.id_annee = ? AND u.id_promotion = ?
            
            ORDER BY u.code, m.designation, e.nom, e.post_nom
        `;
        return await this.read(sql, [anneeId, promotionId]);
    }

    async updateNote(noteId, value, agentId, justification) {
        const sql = `
            UPDATE fiche_cotation 
            SET examen = ?,
                updated_at = NOW(),
                updated_by = ?
            WHERE id = ?
        `;
        await this.update(sql, [value, agentId, noteId]);

        // Log the modification
        const logSql = `
            INSERT INTO note_historique 
            (id_note, id_agent, justification, ancienne_valeur, nouvelle_valeur) 
            VALUES (?, ?, ?, (SELECT examen FROM fiche_cotation WHERE id = ?), ?)
        `;
        await this.create(logSql, [noteId, agentId, justification, noteId, value]);
    }

    async addNote(matiereId, etudiantId, value, agentId) {
        const sql = `
            INSERT INTO fiche_cotation 
            (id_matiere, id_etudiant, examen, created_by, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
        return await this.create(sql, [matiereId, etudiantId, value, agentId]);
    }

    async addNoteNotification(noteId, agentId, justification) {
        const sql = `
            INSERT INTO note_historique 
            (id_note, id_agent, justification, operation_type)
            VALUES (?, ?, ?, 'INSERT')
        `;
        return await this.create(sql, [noteId, agentId, justification]);
    }
}

module.exports = PromotionModel;