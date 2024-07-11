const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT de l'utilisateur et autoriser l'accès aux routes protégées.
module.exports = (req, res, next) => {
   try {
        // Extrait le token du header d'autorisation et le vérifie.
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
        // Ajoute l'identifiant de l'utilisateur à l'objet de requête pour une utilisation ultérieure.
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
        // En cas d'échec de la vérification, renvoie une erreur 401 (Non autorisé).
       res.status(401).json({ error });
   }
};