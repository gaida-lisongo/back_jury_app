const UserController = require('./UserController');
const DashboardModel = require('../models/DashboardModel');

class DashboardController extends UserController {
    constructor() {
        super();
        this.model = new DashboardModel();
    }

    async resultat(req, res) {
        try {
            const { promotionId, anneeId } = req.params;
            return await this.withCache(res, `resultat_${promotionId}_${anneeId}`, async () => {
                const students = await this.model.getStudentsByPromotion(promotionId, anneeId);
                const courses = await this.model.getCoursesByPromotion(promotionId);
                
                const results = {
                    passed: 0,
                    failed: 0,
                    total: students.length
                };

                for (const student of students) {
                    let totalCredits = 0;
                    for (const course of courses) {
                        const [grade] = await this.model.getStudentGrades(student.id, course.id);
                        if (grade && grade.note >= 10) {
                            totalCredits += course.credits;
                        }
                    }
                    if (totalCredits >= 30) {
                        results.passed++;
                    } else {
                        results.failed++;
                    }
                }

                return results;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async histogramme(req, res) {
        try {
            const { promotionId } = req.params;
            return await this.withCache(res, `histogramme_${promotionId}`, async () => {
                const recoursData = await this.model.getRecoursDistribution(promotionId);
                return recoursData;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async bestPurcent(req, res) {
        try {
            const { anneeId } = req.params;
            return await this.withCache(res, `best_${anneeId}`, async () => {
                const [bestStudent] = await this.model.getBestStudent(anneeId);
                return bestStudent;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async selling(req, res) {
        try {
            const { anneeId } = req.params;
            return await this.withCache(res, `selling_${anneeId}`, async () => {
                const stats = await this.model.getValidationSheetsStats(anneeId);
                const formatted = {
                    'SEMESTRE 1': 0,
                    'SEMESTRE 2': 0,
                    'ANNUELLE': 0
                };
                
                stats.forEach(stat => {
                    formatted[stat.type_validation] = stat.total;
                });
                
                return formatted;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async statData(req, res) {
        try {
            const { promotionId, anneeId } = req.params;
            return await this.withCache(res, `stat_${promotionId}_${anneeId}`, async () => {
                const students = await this.model.getStudentsByPromotion(promotionId, anneeId);
                const decisions = {
                    'ADMIS': 0,
                    'AJOURN': 0,
                    'EXCLUS': 0
                };

                for (const student of students) {
                    // Calculer la décision pour chaque étudiant
                    const decision = await this.calculateDecision(student.id);
                    decisions[decision]++;
                }

                return decisions;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async calculateDecision(studentId) {
        // Logique de calcul de la décision
        // À implémenter selon vos règles spécifiques
    }
}

module.exports = DashboardController;