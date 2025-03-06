const UserController = require('./UserController');
const PromotionModel = require('../models/PromotionModel');
const mailer = require('../utils/mailer');

class PromotionController extends UserController {
    constructor() {
        super();
        this.model = new PromotionModel();
    }

    async grillesPromotion(req, res) {
        try {
            const { anneeId, promotionId, type } = req.params;
            const matieresOfPromotion = await this.model.getMatieresOfPromotion(promotionId);

            const totalCredits = matieresOfPromotion.reduce((acc, matiere) => acc + matiere.credit, 0);
            const maxPromotionCredits = 20 * totalCredits;

            const cacheKey = `gri-lles_${promotionId}_${anneeId}_${type}`;

            return await this.withCache(res, cacheKey, async () => {
                const data = await this.model.getGrillePromotion(anneeId, promotionId, type);
                
                // Organize data by units and students
                const grille = this.organizeGrilleData(data, maxPromotionCredits);
                return grille;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async changeCote(req, res) {
        try {
            const { coteId, type } = req.params;
            const { value, justification, agentId, lastValue} = req.body;


            // Récupérer l'ancienne valeur
            const oldNote = await this.model.getNoteDetails(coteId);
            
            // Mettre à jour la note
            await this.model.updateNote(coteId, value, agentId, justification, type, lastValue);

            // Envoyer l'email de notification
            const notif = await this.sendMail(
                "contact@admin.inbtp.net",
                "Modification de note - INBTP Jury",
                `
                    <h2>${oldNote.nom} ${oldNote.postnom} ${oldNote.prenom}</h2>
                    <hr />
                    <p><strong>Matière:</strong> ${oldNote.cours}</p>
                    <p><strong>Type de note:</strong> ${oldNote.cote}</p>
                    <p><strong>Ancienne valeur:</strong> ${oldNote.last_val}</p>
                    <p><strong>Nouvelle valeur:</strong> ${value}</p>
                    <p><strong>Modifié par:</strong> ${oldNote.agent}</p>
                    <p><strong>Justification:</strong> ${justification}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                `
            )
            
            // Clear related cache
            await this.deleteFromCache('grille_*');
            
            return this.success(res, null, 'Note modifiée avec succès');
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async addCote(req, res) {
        try {
            const { matiereId, etudiantId, value, justification, agentId, anneeId } = req.body;
            const { type } = req.params;
            const noteId = await this.model.addNote(matiereId, etudiantId, value, agentId, type, anneeId);
          
            // Récupérer l'ancienne valeur
            const oldNote = await this.model.getCoteDetail(noteId);

            // Envoyer l'email de notification
            const notif = await this.sendMail(
                "contact@admin.inbtp.net",
                "Insertion de note - INBTP Jury",
                `
                    <h2>${oldNote.nom} ${oldNote.postnom} ${oldNote.prenom}</h2>
                    <br />
                    <p><strong>Matière:</strong> ${oldNote.cours}</p>
                    <p><strong>Type de note:</strong> ${(type).toUpperCase()}</p>
                    <p><strong>Valeur de la cote:</strong> ${value}</p>
                    <p><strong>Insérer par:</strong> ${oldNote.agent}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>REF/ID:</strong> ${noteId}</p>
                `
            )
            // await this.model.addNoteNotification(noteId, agentId, justification);
            
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

    organizeGrilleData(data, max) {
        const grille = {
            unites: {},
            moyennes: max,
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
                nom: `${row.nom} ${row.post_nom} ${row.prenom}`,
                total: row.total,
                tp: row.tp,
                td: row.td,
                examen: row.examen,
                rattrapage: row.rattrapage,
                ncnv: row.ncnv
            });
        });

        //  Calculate moyennes de la promotion
        /*
        1. Recupération de 
        */

        return grille;
    }
}

module.exports = PromotionController;