const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Route handler for file upload
const handleFileUpload = (req, res) => {
  try {
    // Check if file exists
    console.log(req);
    
    if (!req.file && !req.files) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Handle single file upload
    if (req.file) {
      return res.status(200).json({
        success: true,
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: `/uploads/${req.file.filename}`,
          type: path.extname(req.file.originalname).substr(1)
        }
      });
    }

    // Handle multiple file uploads
    if (req.files) {
      const uploadedFiles = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        type: path.extname(file.originalname).substr(1)
      }));

      return res.status(200).json({
        success: true,
        files: uploadedFiles
      });
    }
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed',
      error: error.message 
    });
  }
};

// Serve uploaded files
const serveUploadedFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      message: 'File not found' 
    });
  }

  // Set appropriate content type
  const fileExt = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  switch(fileExt) {
    case '.pdf':
      contentType = 'application/pdf';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
  }

  res.setHeader('Content-Type', contentType);
  res.sendFile(filePath);
};

// Export all functions
module.exports = {
  uploadSingle: upload.single('file'),
  uploadMultiple: upload.array('files', 5),
  handleFileUpload,
  serveUploadedFile
};
