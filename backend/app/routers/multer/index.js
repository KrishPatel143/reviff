const express = require('express');
const router = express.Router();
const multerControllers = require('./lib/controllers');
const auth = require('../users/lib/middlewares');

// Single file upload route (authenticated)
router.post('/upload', 
  auth,
  multerControllers.uploadSingle,
  multerControllers.handleFileUpload
);

// Multiple file upload route (authenticated)
router.post('/upload-multiple', 
  auth,
  multerControllers.uploadMultiple,
  multerControllers.handleFileUpload
);

// Route to serve uploaded files
router.get('/uploads/:filename', multerControllers.serveUploadedFile);

module.exports = router;