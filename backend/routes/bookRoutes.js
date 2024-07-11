const express = require('express');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const books = require('../controllers/books');
const multer = require('../middleware/multer-config');
const resizeImage = require('../middleware/sharp-config.js');

// Définition des routes

// Créer un nouveau livre
router.post('/', auth, multer.upload, resizeImage, books.createBook);

// Obtenir tous les livres
router.get('/', auth, books.getAllBook);

// Obtenir un livre par ID
router.get('/:id', auth, books.getOneBook);

// Mettre à jour un livre
router.put('/:id', auth, multer.upload, resizeImage, books.updateBook);

// Supprimer un livre
router.delete('/:id', auth, books.deleteBook);

module.exports = router;
