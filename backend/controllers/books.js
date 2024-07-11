const Book = require('../models/bookModel');
const fs = require('fs');
const path = require('path');

// Récupère et renvoie tous les livres de la base de données.
exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Récupère un livre spécifique par son ID.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      book.averageRating = Math.floor(book.averageRating * 10) / 10;
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

// Crée un livre dans la base de données
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.thing);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Thing({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

// Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

// Mettre à jour un livre déjà présent dans la base de données.
exports.updateBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Livre modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

// Attribue une note à un livre que l'on ne possède pas et calcule la moyenne d'étoiles de ce livre.
exports.rateOneBook = (req, res, next) => {
  // Récupère l'ID de l'utilisateur et la note depuis le corps de la requête
  const userId = req.body.userId;
  const grade = req.body.rating;

  // Vérifie que la note est comprise entre 0 et 5
  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  // Cherche le livre dans la base de données par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Si le livre n'est pas trouvé, retourne une erreur 400
      if (!book) {
        return res.status(400).json({ message: 'Livre non trouvé! ' });
      }
      // Vérifie que l'utilisateur n'essaie pas de noter son propre livre
      if (book.userId === req.auth.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      // Vérifie si l'utilisateur a déjà noté ce livre
      const hasAlreadyRated = book.ratings.some(
        (rating) => rating.userId.toString() === userId
      );
      if (hasAlreadyRated) {
        return res.status(400).json({ message: 'L\'utilisateur a déjà noté ce livre' });
      }
      // Ajoute la nouvelle note au tableau des notes du livre
      book.ratings.push({ userId, grade });
      // Calcule la nouvelle moyenne des notes
      const totalGrade = book.ratings.reduce(
        (accumulator, currentValue) => accumulator + currentValue.grade,
        0
      );
      book.averageRating = totalGrade / book.ratings.length;

      // Sauvegarde les modifications dans la base de données
      book
        .save()
        .then(() => res.status(200).json(book)) // Si tout est OK, retourne le livre avec la nouvelle note
        .catch((error) => res.status(400).json({ error })); // En cas d'erreur, retourne une erreur 400
    })
    .catch((error) => res.status(400).json({ error })); // En cas d'erreur lors de la recherche du livre, retourne une erreur 400
};

// Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
exports.bestRatings = (req, res, next) => {
  // Cherche tous les livres dans la base de données
  Book.find()
    .sort({ averageRating: -1 }) // Trie les livres par note moyenne décroissante
    .limit(3) // Limite le résultat aux 3 meilleurs livres
    .then((books) => {
      res.status(200).json(books); // Si tout est OK, retourne les 3 meilleurs livres
    })
    .catch((error) => {
      res.status(400).json({ error }); // En cas d'erreur, retourne une erreur 400
    });
};
