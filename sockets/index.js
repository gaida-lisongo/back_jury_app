const HomeSocket = require('./homeSocket');
// const UserSocket = require('./userSocket');
// const DashboardSocket = require('./dashboardSocket');
// const PromotionSocket = require('./promotionSocket');
// const ProduitSocket = require('./produitSocket');

function initializeSockets(io) {
    new HomeSocket(io);
    // new UserSocket(io);
    // new DashboardSocket(io);
    // new PromotionSocket(io);
    // new ProduitSocket(io);
}

module.exports = initializeSockets;