const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const token = req.headers.authorization.split(' ')[1];
        
        // Vérifier le token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les informations de l'utilisateur à la requête
        req.user = decodedToken;
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentification requise',
            error: error.message
        });
    }
};