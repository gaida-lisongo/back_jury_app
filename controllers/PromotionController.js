const Controller = require('./Controller');
const PromotionModel = require('../models/PromotionModel');

class PromotionController extends Controller {
    constructor() {
        super();
        this.model = new PromotionModel();
    }

    async grillesPromotion(req, res) {
        try {
            const { anneeId, promotionId, type } = req.params;
            const cacheKey = `grille_${promotionId}_${anneeId}_${type}`;

            return await this.withCache(res, cacheKey, async () => {
                const data = await this.model.getGrillePromotion(anneeId, promotionId, type);
                
                // Organize data by units and students
                const grille = this.organizeGrilleData(data);
                return grille;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async changeCote(req, res) {
        try {
            const { coteId } = req.params;
            const { value, justification } = req.body;
            const agentId = req.user.id;

            await this.model.updateNote(coteId, value, agentId, justification);
            
            // Clear related cache
            await this.deleteFromCache('grille_*');
            
            return this.success(res, null, 'Note modifiée avec succès');
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async addCote(req, res) {
        try {
            const { matiereId, etudiantId, value, justification } = req.body;
            const agentId = req.user.id;

            const noteId = await this.model.addNote(matiereId, etudiantId, value, agentId);
            await this.model.addNoteNotification(noteId, agentId, justification);
            
            // Clear related cache
            await this.deleteFromCache('grille_*');
            
            return this.success(res, { noteId }, 'Note ajoutée avec succès');
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async notificationCote(req, res) {
        try {
            const { coteId } = req.params;
            const { agentId, justification } = req.body;

            await this.model.addNoteNotification(coteId, agentId, justification);
            return this.success(res, null, 'Notification enregistrée avec succès');
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    organizeGrilleData(data) {
        const grille = {
            unites: {},
            moyennes: {},
            decisions: {}
        };

        data.forEach(row => {
            if (!grille.unites[row.unite_code]) {
                grille.unites[row.unite_code] = {
                    id: row.unite_id,
                    code: row.unite_code,
                    designation: row.unite_designation,
                    matieres: {}
                };
            }

            if (!grille.unites[row.unite_code].matieres[row.matiere_id]) {
                grille.unites[row.unite_code].matieres[row.matiere_id] = {
                    id: row.matiere_id,
                    designation: row.matiere_designation,
                    credit: row.credit,
                    notes: []
                };
            }

            grille.unites[row.unite_code].matieres[row.matiere_id].notes.push({
                noteId: row.note_id,
                etudiantId: row.etudiant_id,
                nom: `${row.nom} ${row.postnom}`,
                total: row.total,
                tp: row.tp,
                td: row.td,
                examen: row.examen,
                rattrapage: row.rattrapage,
                ncnv: row.ncnv
            });
        });

        return grille;
    }
}

module.exports = PromotionController;