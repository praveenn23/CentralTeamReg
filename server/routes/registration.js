const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Registration = require('../models/Registration');
const { sendRegistrationEmail } = require('../utils/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 3 // Maximum 3 files
  }
});

// Handle file upload errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.warn('Multer error: File too large'); // Log the error
      return res.status(400).json({
        message: 'File too large. Maximum size is 10MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      console.warn('Multer error: Too many files'); // Log the error
      return res.status(400).json({
        message: 'Too many files. Maximum 3 files allowed.'
      });
    }
    console.error(`Multer error: ${err.message}`); // Log other Multer errors
    return res.status(400).json({
      message: `File upload error: ${err.message}`
    });
  }
  next(err);
};

// Registration route
router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'sop', maxCount: 1 },
  { name: 'recommendationLetter', maxCount: 1 }
]), handleMulterError, async (req, res) => {
  try {
    console.log('Backend: Received registration request');
    console.log('Backend: Request body keys:', Object.keys(req.body));
    if (req.files) {
      console.log('Backend: Received files:', Object.keys(req.files));
    }

    // Parallel validation of required fields and files
    console.log('Backend: Starting parallel validation');
    const validationPromises = [
      // Validate required fields
      (async () => {
        const requiredFields = ['fullName', 'uid', 'cluster', 'institute', 'department', 'phoneNumber', 'email', 'leadershipRoles', 'yourPosition', 'nameOfEntity', 'isServingLeadPosition', 'terms'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      })(),

      // Validate email format
      (async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          throw new Error('Invalid email format');
        }
      })(),

      // Check for duplicate UID or email
      (async () => {
        const existingRegistration = await Registration.findOne({
          $or: [
            { uid: req.body.uid },
            { email: req.body.email }
          ]
        });

        if (existingRegistration) {
          throw new Error(existingRegistration.uid === req.body.uid ? 
            'UID already registered' : 
            'Email already registered');
        }
      })(),

      // Validate file uploads
      (async () => {
        if (!req.files || Object.keys(req.files).length === 0) {
          throw new Error('No files uploaded');
        }

        const requiredFiles = ['resume', 'sop', 'recommendationLetter'];
        const missingFiles = requiredFiles.filter(fileType => !req.files[fileType]);
        
        if (missingFiles.length > 0) {
          throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
        }
      })()
    ];

    // Wait for all validations to complete
    await Promise.all(validationPromises);
    console.log('Backend: All validations passed');

    // Create new registration
    const termsArray = req.body.terms ? JSON.parse(req.body.terms) : [];
    const isServingLeadPositionBoolean = req.body.isServingLeadPosition === 'true';

    console.log('Backend: Preparing registration object');
    const registration = new Registration({
      ...req.body,
      resume: req.files.resume[0].filename,
      sop: req.files.sop[0].filename,
      recommendationLetter: req.files.recommendationLetter[0].filename,
      terms: termsArray,
      isServingLeadPosition: isServingLeadPositionBoolean,
      status: 'pending'
    });

    // Save registration
    console.log('Backend: Saving registration to database');
    await registration.save();
    console.log('Backend: Registration saved successfully');

    res.status(201).json({
      message: 'Registration submitted successfully',
      registration: {
        id: registration._id,
        fullName: registration.fullName,
        uid: registration.uid,
        cluster: registration.cluster,
        status: registration.status
      }
    });
    console.log('Backend: Response sent');

    // Send registration email in the background (non-blocking)
    sendRegistrationEmail(registration.email, registration.fullName)
      .then(() => console.log('Backend: Registration email sent successfully (background)'))
      .catch(emailError => console.error('Backend: Error sending registration email (background):', emailError));

  } catch (error) {
    console.error('Backend: Registration error:', error);
    
    // Clean up uploaded files if registration fails
    if (req.files) {
      console.log('Backend: Cleaning up uploaded files due to error');
      await Promise.all(
        Object.values(req.files).map(files =>
          Promise.all(files.map(file =>
            new Promise((resolve) => {
              const filePath = path.join(__dirname, '../uploads', file.filename);
              fs.unlink(filePath, (err) => {
                if (err) console.error('Backend: Error deleting file:', err);
                resolve();
              });
            })
          ))
        )
      );
      console.log('Backend: File cleanup complete');
    }

    // Determine appropriate status code and message
    let statusCode = 500;
    let errorMessage = 'Error processing registration';

    if (error.message.includes('Missing required fields') || 
        error.message.includes('Invalid email format') || 
        error.message.includes('UID already registered') || 
        error.message.includes('Email already registered') ||
        error.message.includes('No files uploaded') ||
        error.message.includes('Missing required files') ||
        error.message.includes('Invalid file type')) {
      statusCode = 400; // Bad Request for validation errors
      errorMessage = error.message; // Use the specific validation error message
    }

    res.status(statusCode).json({
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    console.log('Backend: Error response sent');
  }
});

// Get all registrations (admin only)
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get registration by ID
router.get('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }
    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update registration status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    console.log('Testing email configuration...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing');

    await sendRegistrationEmail(email, name);
    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 
