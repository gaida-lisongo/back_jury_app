const Controller = require('./Controller');
const HomeModel = require('../models/HomeModel');
const cache = require('../utils/cache');

class HomeController extends Controller {
    constructor() {
        super();
        this.model = new HomeModel();
        this.annees = this.model.getAnneesAcad()
                        .then((result) => {
                            console.log("result", result);
                            return result;
                            
                        })
                        .catch((error) => {
                            return error;
                        });
        
    }

    async index(req, res) {
        return await this.withCache(res, 'index', async () => {
            const [stats] = await this.model.getDashboardStats();
            const activities = await this.model.getRecentActivities();
            
            return {
                stats,
                activities,
                serverTime: new Date().toISOString()
            };
        });
    }
    

    async getServerStatus(req, res) {
        try {
            const status = {
                uptime: process.uptime(),
                timestamp: Date.now(),
                serverInfo: {
                    node: process.version,
                    memory: process.memoryUsage(),
                    platform: process.platform
                }
            };
            return this.success(res, status);
        } catch (error) {
            return this.error(res, error.message);
        }
    }
}

module.exports = HomeController;