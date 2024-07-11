const mongoose = require("mongoose");

// Définition du schéma du livre, incluant les informations de base et les évaluations.
const bookSchema = mongoose.Schema({
  userId: { type: String, required: true }, // Identifiant de l'utilisateur qui a ajouté le livre
  title: { type: String, required: true }, // Titre du livre
  author: { type: String, required: true }, // Auteur du livre
  imageUrl: { type: String, required: true }, // URL de l'image de couverture du livre
  year: { type: Number, required: true }, // Année de publication
  genre: { type: String, required: true }, // Genre du livre
  ratings: [
    // Liste des évaluations du livre
    {
      userId: { type: String, required: true }, // Identifiant de l'utilisateur qui a évalué le livre
      grade: { type: Number, required: true }, // Note attribuée
    },
  ],
  averageRating: { type: Number, required: true }, // Note moyenne du livre
});

// Exporte le modèle pour être utilisé dans l'application.
module.exports = mongoose.model("Book", bookSchema);