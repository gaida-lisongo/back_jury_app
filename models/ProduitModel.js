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
                e.prenom
            FROM commande_recours cr
            INNER JOIN recours ON recours.id = cr.id_recours
            INNER JOIN matiere m ON m.id = cr.id_matiere
            INNER JOIN etudiant e ON e.id = cr.id_etudiant
            WHERE cr.statut = 'OK' AND recours.id_promotion = ?
            ORDER BY cr.date_creation DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async retrait_recours(promotionId) {
        const sql = `
            SELECT 
                rr.*,
                CONCAT(a.nom, ' ', a.post_nom) as agent_retrait,
                a.telephone,
                a.e_mail,
                a.matricule
            FROM retrait_recours rr
            INNER JOIN agent a ON a.id = rr.id_agent
            WHERE rr.id_promotion = ?
            ORDER BY rr.date_creation DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async fichesValid(promotionId) {
        const sql = `
            SELECT 
                cv.*,
                e.nom,
                e.post_nom,
                e.prenom
            FROM commande_validation cv
            INNER JOIN fiche_validation fv ON fv.id = cv.id_validation
            INNER JOIN etudiant e ON e.id = cv.id_etudiant
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
                CONCAT(a.nom, ' ', a.post_nom, ' ', a.prenom ) as agent_retrait
            FROM retrait_validation rv
            INNER JOIN agent a ON a.id = rv.id_agent
            WHERE rv.id_promotion = ?
            ORDER BY rv.date_creation DESC
        `;
        return await this.read(sql, [promotionId]);
    }

    async addRetraits(type, data) {
        let sql, params;

        if (type == 'RECOURS') {
            sql = `
                INSERT INTO retrait_recours (id_agent, date_creation, montant, statut, date_validation, transaction, id_promotion)
                VALUES (?, NOW(), ?, 'OK', NOW(), ?, ?)
            `;
            params = [data.agentId, data.montant, data.transaction, data.promotionId];
        } else {
            sql = `
                INSERT INTO retrait_validation (id_agent, date_creation, montant, statut, date_validation, transaction, id_promotion)
                VALUES (?, NOW(),?,'OK', NOW(),?,?)
            `;
            params = [data.agentId, data.montant, data.transaction, data.promotionId];
        }

        return await this.create(sql, params);
    }
}

module.exports = ProduitModel;