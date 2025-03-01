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
            return await this.withCache(res, `metrique_1:${promotionId}_${anneeId}`, async () => {
                const students = await this.model.getBestStudent(anneeId, promotionId);
                const courses = await this.model.getCoursesByPromotion(promotionId);
                // console.log("enpoint /dashboard/resultat", { students, courses });
                
                let results = {
                    passed: 0,
                    failed: 0,
                    total: students.length
                };

                let credits = 0;
                for (const course of courses) {
                    credits += course.credit;

                }

                for (const student of students) {
                    let totalCredits = student.ncnv;

                    if (credits && (totalCredits * 100/credits) > 25.0) {
                        results.failed++;
                    } else {
                        results.passed++;
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
            return await this.withCache(res, `metrique_2:${promotionId}`, async () => {
                const recoursData = await this.model.getRecoursDistribution(promotionId);
                return recoursData;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async bestPurcent(req, res) {
        try {
            const { anneeId, promotionId } = req.params;
            return await this.withCache(res, `metrique_3:${promotionId}_${anneeId}`, async () => {
                const [bestStudent] = await this.model.getBestStudent(anneeId, promotionId);

                //Acumuler les notes
                let total = 0;
                const courses = await this.model.getCoursesByPromotion(promotionId);

                total = courses.reduce((acc, course) => {
                    return acc + 20 * course.credit;
                }, 0);

                if (bestStudent) {
                    const pourcentage = total != 0 ? ((bestStudent.note * 100) / total).toFixed(2) : 0.0;
                
                    return {...bestStudent, pourcentage};
                } else {
                    return;
                }
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async selling(req, res) {
        try {
            const { promotionId } = req.params;
            return await this.withCache(res, `metrique_4:${promotionId}`, async () => {
                const stats = await this.model.getValidationSheetsStats(promotionId);
                
                const formatted = {
                    'SEMESTRE 1': 0,
                    'SEMESTRE 2': 0,
                    'ANNUELLE': 0
                };
                
                stats.forEach(stat => {
                    formatted[stat.type] = stat.ca;
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
            return await this.withCache(res, `metrique_5:${promotionId}_${anneeId}`, async () => {
                const students = await this.model.getBestStudent(anneeId, promotionId);
                //Acumuler les notes
                let total = 0;
                let credits = 0;
                const courses = await this.model.getCoursesByPromotion(promotionId);

                credits = courses.reduce((acc, course) => {
                    return acc + course.credit;
                }, 0);

                total = courses.reduce((acc, course) => {
                    return acc + 20 * course.credit;
                }, 0);

                const decisions = [
                    {
                        "appreciation": "Excellent",
                        "pourcentage": 90
                    },
                    {
                        "appreciation": "Très bien",
                        "pourcentage": 80
                    },
                    {
                        "appreciation": "Bien",
                        "pourcentage": 70
                    },
                    {
                        "appreciation": "Assez bien",
                        "pourcentage": 60
                    },
                    {
                        "appreciation": "Passable",
                        "pourcentage": 50
                    },
                    {
                        "appreciation": "Insuffisant",
                        "pourcentage": 40
                    },
                    {
                        "appreciation": "Très insuffisant",
                        "pourcentage": 30
                    },
                    {
                        "appreciation": "Nul",
                        "pourcentage": 20
                    }
                ]
                
                const results = this.calculateDecision(total, credits, students, decisions);
                return results;
            });
        } catch (error) {
            return this.error(res, error.message);
        }
    }

    async calculateDecision(max, credits, cotes, decisions) {
        let result = [];

        for (const decision of decisions) {
            let total = 0;
            
            for (const cote of cotes) {
                const pourcentage = cote.note * 100 / max;

                if (pourcentage >= decision.pourcentage) {
                    total++;
                }
            }

            result.push({
                appreciation: decision.appreciation,
                total: total,
                pourcentage: decision.pourcentage
            });
        }

        return result;
    }
}

module.exports = DashboardController;