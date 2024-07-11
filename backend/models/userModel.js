const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Définition du schéma de l'utilisateur avec validation d'unicité pour l'email.
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Application du plugin pour valider l'unicité des champs requis.
userSchema.plugin(uniqueValidator);

// Exporte le modèle pour être utilisé dans l'application.
module.exports = mongoose.model("User", userSchema);