const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription d'un nouvel utilisateur avec hachage du mot de passe.
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // Hache le mot de passe avec un salt de 10.
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash, // Utilise le mot de passe haché pour la création de l'utilisateur.
      });
      user
        .save() // Sauvegarde l'utilisateur dans la base de données.
        .then(() => res.status(200).json({ message: "Utilisateur enregistré" }))
        .catch((error) => {
          res.status(400).json({ error }); // Gestion des erreurs de sauvegarde.
        });
    })
    .catch((error) => res.status(500).json({ error })); // Gestion des erreurs de hachage.
};

// Connexion d'un utilisateur existant et génération d'un token JWT.
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // Recherche de l'utilisateur par email.
    .then((user) => {
      if (user === null) {
        // Si aucun utilisateur trouvé, renvoie une erreur.
        res
          .status(401)
          .json({ message: "Paire identifiant / Mot de passe incorrect" });
      } else {
        bcrypt
          .compare(req.body.password, user.password) // Compare le mot de passe fourni avec celui enregistré.
          .then((valid) => {
            if (!valid) {
              // Si les mots de passe ne correspondent pas, renvoie une erreur.
              res.status(401).json({
                message: "Paire identifiant / Mot de passe incorrect",
              });
            } else {
              // Si les mots de passe correspondent, génère et renvoie un token JWT.
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
                  expiresIn: "24h", // Le token expire après 24 heures.
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error }); // Gestion des erreurs de comparaison.
          });
      }
    })
    .catch((error) => res.status(500).json({ error })); // Gestion des erreurs de recherche.
};