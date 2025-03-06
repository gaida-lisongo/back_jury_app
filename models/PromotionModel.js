const UserModel = require('./UserModel');

class PromotionModel extends UserModel {
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
    async getMatieresOfPromotion(promotionId) {
        const sql = `
            SELECT m.*
            FROM unite u
            INNER JOIN matiere m ON m.id_unite = u.id
            WHERE u.id_promotion = ? 
        `;
        return await this.read(sql, [ promotionId]);
    }

    async updateNote(noteId, value, agentId, justification, type, lastValue = null) {
        const sql = `
            UPDATE fiche_cotation 
            SET ${type} = ?,
                updated_at = NOW(),
                updated_by = ?
            WHERE id = ?
        `;
        await this.update(sql, [value, agentId, noteId]);

        // Log the modification
        const logSql = `
            INSERT INTO insertion (id_fiche_cotation, id_agent, cote, last_val, description) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await this.create(logSql, [noteId, agentId, type, lastValue, justification]);
    }

    async addNote(matiereId, etudiantId, value, agentId, type, anneeId) {
        const sql = `
            INSERT INTO fiche_cotation 
            (id_matiere, id_etudiant, ${type}, created_by, id_annee)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.create(sql, [matiereId, etudiantId, value, agentId, anneeId]);
    }

    async addNoteNotification(noteId, agentId, justification) {
        const sql = `
            INSERT INTO note_historique 
            (id_note, id_agent, justification, operation_type)
            VALUES (?, ?, ?, 'INSERT')
        `;
        return await this.create(sql, [noteId, agentId, justification]);
    }

    async getNoteDetails(noteId) {
        const sql = `
            SELECT 
                i.*,
                e.nom,
                e.post_nom AS 'postnom',
                e.prenom,
                CONCAT(a.nom, ' ', a.post_nom, ' (', a.matricule, ')') AS agent,
                m.designation as cours
            FROM fiche_cotation fc
            INNER JOIN insertion i ON i.id_fiche_cotation = fc.id
            INNER JOIN agent a ON a.id = i.id_agent
            INNER JOIN etudiant e ON e.id = fc.id_etudiant
            INNER JOIN matiere m ON m.id = fc.id_matiere
            WHERE fc.id = ?
        `;
        const [note] = await this.read(sql, [noteId]);
        return note;
    }

    async getCoteDetail(noteId) {
        const sql = `
            SELECT 
                fc.*,
                e.nom,
                e.post_nom AS 'postnom',
                e.prenom,
                CONCAT(a.nom, ' ', a.post_nom, ' (', a.matricule, ')') AS agent,
                m.designation as cours
            FROM fiche_cotation fc
            INNER JOIN agent a ON a.id = fc.created_by
            INNER JOIN etudiant e ON e.id = fc.id_etudiant
            INNER JOIN matiere m ON m.id = fc.id_matiere
            WHERE fc.id = ?
        `;
        const [note] = await this.read(sql, [noteId]);
        return note;
    }
}

module.exports = PromotionModel;