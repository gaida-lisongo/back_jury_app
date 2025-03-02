const UserController = require('./UserController');
const ProduitModel = require('../models/ProduitModel');

class ProduitController extends UserController {
    constructor() {
        super();
        this.model = new ProduitModel();
    }

    async recoursPromotion(req, res) {
        try {
            const { promotionId } = req.params;
            console.log(promotionId);
            return await this.withCache(res, `recours_${promotionId}`, async () => {
                const recours = await this.model.recoursPromotion(promotionId);
                return recours;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async retrait_recours(req, res) {
        try {
            const { promotionId } = req.params;
            return await this.withCache(res, `retrait_recours_${promotionId}`, async () => {
                const retraits = await this.model.retrait_recours(promotionId);
                return retraits;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async fichesValid(req, res) {
        try {
            const { promotionId } = req.params;
            return await this.withCache(res, `fiches_${promotionId}`, async () => {
                const fiches = await this.model.fichesValid(promotionId);
                return fiches;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async retraitsFiches(req, res) {
        try {
            const { promotionId } = req.params;
            return await this.withCache(res, `retraits_fiches_${promotionId}`, async () => {
                const retraits = await this.model.retraitsFiches(promotionId);
                return retraits;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async addRetraits(req, res) {
        try {
            const { type } = req.params;
            const data = {
                ...req.body
            };
            console.log(data)
            const retraitId = await this.model.addRetraits(type, data);
            
            // Clear related cache
            await this.deleteFromCache(`retrait_*`);
            await this.deleteFromCache(`retraits_fiches_*`);

            return this.success(res, { retraitId }, 'Retrait enregistré avec succès');
        } catch (error) {
            return this.error(res, error.message);
        }
    }
}

module.exports = ProduitController;