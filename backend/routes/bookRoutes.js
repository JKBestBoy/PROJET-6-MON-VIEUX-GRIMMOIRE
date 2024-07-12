const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const books = require('../controllers/books');
const multer = require('../middleware/multer-config');
const resizeImage = require('../middleware/sharp-config.js');

// Définition des routes

// Créer un nouveau livre
router.post('/', auth, multer, resizeImage, books.createBook);

// Obtenir tous les livres
router.get('/', books.getAllBook);


router.get('/bestrating', books.getBestRating);


// Obtenir un livre par ID
router.get('/:id', books.getOneBook);

// Mettre à jour un livre
router.put('/:id', auth, multer, resizeImage, books.modifyBook);

// Supprimer un livre
router.delete('/:id', auth, books.deleteBook);


router.post('/:id/rating', auth, books.createRating);


module.exports = router;
