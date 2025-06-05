const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { auth } = require('../middleware/auth');
const { isAdminOrManager } = require('../middleware/roles');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types for course materials
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|mp4|avi|mov|mkv|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload images, documents, or videos.'));
    }
  }
});

// Upload file to Cloudinary
router.post('/upload', auth, isAdminOrManager, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine resource type based on file type
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw'; // For documents
    }    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'course-materials',
          public_id: `${Date.now()}-${req.file.originalname}`,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      filename: req.file.originalname,
      format: result.format
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
});

// Delete file from Cloudinary
router.delete('/delete/:public_id', auth, isAdminOrManager, async (req, res) => {
  try {
    const { public_id } = req.params;
    const { resource_type } = req.query;

    await cloudinary.uploader.destroy(public_id, { 
      resource_type: resource_type || 'auto' 
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting file', 
      error: error.message 
    });
  }
});

module.exports = router;
