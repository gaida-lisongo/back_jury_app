const UserModel = require('./UserModel');

class ProduitModel extends UserModel {
    constructor() {
        super('produit');
    }

    async recoursPromotion(promotionId) {
        const sql = `
            SELECT 
                cr.*,
                m.designation as matiere,
                e.nom,
                e.post_nom,
                e.prenom,
                CONCAT(a.nom, ' ', a.post_nom) as agent
            FROM commande_recours cr
            INNER JOIN matiere m ON m.id = cr.id_matiere
            INNER JOIN etudiant e ON e.id = cr.id_etudiant
            INNER JOIN agent a ON a.id = cr.created_by
            WHERE m.id_unite IN (
                SELECT id FROM unite WHERE id_promotion = ?
            )
            AND cr.statut = 'OK'
            ORDER BY cr.date_creation DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async retrait_recours(promotionId) {
        const sql = `
            SELECT 
                rr.*,
                cr.reference,
                m.designation as matiere,
                e.nom,
                e.post_nom,
                e.prenom,
                CONCAT(a.nom, ' ', a.post_nom) as agent_retrait
            FROM retrait_recours rr
            INNER JOIN commande_recours cr ON cr.id = rr.id_commande
            INNER JOIN matiere m ON m.id = cr.id_matiere
            INNER JOIN etudiant e ON e.id = cr.id_etudiant
            INNER JOIN agent a ON a.id = rr.created_by
            WHERE m.id_unite IN (
                SELECT id FROM unite WHERE id_promotion = ?
            )
            ORDER BY rr.date_retrait DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async fichesValid(promotionId) {
        const sql = `
            SELECT 
                cv.*,
                fv.type_validation,
                e.nom,
                e.post_nom,
                e.prenom,
                CONCAT(a.nom, ' ', a.post_nom) as agent
            FROM commande_validation cv
            INNER JOIN fiche_validation fv ON fv.id = cv.id_fiche
            INNER JOIN etudiant e ON e.id = fv.id_etudiant
            INNER JOIN agent a ON a.id = cv.created_by
            WHERE fv.id_promotion = ?
            AND cv.statut = 'OK'
            ORDER BY cv.date_creation DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async retraitsFiches(promotionId) {
        const sql = `
            SELECT 
                rv.*,
                cv.reference,
                fv.type_validation,
                e.nom,
                e.post_nom,
                e.prenom,
                CONCAT(a.nom, ' ', a.post_nom) as agent_retrait
            FROM retrait_validation rv
            INNER JOIN commande_validation cv ON cv.id = rv.id_commande
            INNER JOIN fiche_validation fv ON fv.id = cv.id_fiche
            INNER JOIN etudiant e ON e.id = fv.id_etudiant
            INNER JOIN agent a ON a.id = rv.created_by
            WHERE fv.id_promotion = ?
            ORDER BY rv.date_retrait DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async addRetraits(type, data) {
        let sql, params;

        if (type === 'RECOURS') {
            sql = `
                INSERT INTO retrait_recours 
                (id_commande, created_by, date_retrait)
                VALUES (?, ?, NOW())
            `;
            params = [data.commandeId, data.agentId];
        } else {
            sql = `
                INSERT INTO retrait_validation 
                (id_commande, created_by, date_retrait)
                VALUES (?, ?, NOW())
            `;
            params = [data.commandeId, data.agentId];
        }

        return await this.create(sql, params);
    }
}

module.exports = ProduitModel;