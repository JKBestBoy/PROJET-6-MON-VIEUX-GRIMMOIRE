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
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) });
};

// Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
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
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Attribue une note à un livre que l'on ne possède pas et calcule la moyenne d'étoiles de ce livre.
exports.rateOneBook = (req, res, next) => {
  const userId = req.body.userId;
  const grade = req.body.rating;

  if (grade < 0 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(400).json({ message: 'Livre non trouvé! ' });
      }
      if (book.userId === req.auth.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const hasAlreadyRated = book.ratings.some(
        (rating) => rating.userId.toString() === userId
      );
      if (hasAlreadyRated) {
        return res.status(400).json({ message: 'L\'utilisateur a déjà noté ce livre' });
      }
      book.ratings.push({ userId, grade });
      const totalGrade = book.ratings.reduce(
        (accumulator, currentValue) => accumulator + currentValue.grade,
        0
      );
      book.averageRating = totalGrade / book.ratings.length;

      book.save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

// Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
exports.bestRatings = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
