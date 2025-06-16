const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const Evaluation = require('../models/Evaluation');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Test admin route
router.get('/test', (req, res) => {
  console.log('Admin test route hit');
  res.json({ message: 'Admin routes are working' });
});

// Admin login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Get admin profile
router.get('/profile', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ 
        message: 'Admin not found' 
      });
    }
    res.json(admin);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      message: 'An error occurred while fetching profile' 
    });
  }
});

// Get all registrations (admin only)
router.get('/registrations', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { uid: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Registration.countDocuments(query);

    // Get paginated results with lean() for better performance
    const registrations = await Registration.find(query)
      .sort({ submittedAt: -1 })
      .select('-terms')
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      registrations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'An error occurred while fetching registrations' });
  }
});

// Get single registration details (admin only)
router.get('/registrations/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ 
        message: 'Registration not found' 
      });
    }
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ 
      message: 'An error occurred while fetching registration details' 
    });
  }
});

// Update registration status (admin only)
router.put('/registrations/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value' 
      });
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ 
        message: 'Registration not found' 
      });
    }

    res.json(registration);
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ 
      message: 'An error occurred while updating registration status' 
    });
  }
});

// Get registration statistics (admin only)
router.get('/statistics', auth, async (req, res) => {
  try {
    const total = await Registration.countDocuments();
    const pending = await Registration.countDocuments({ status: 'pending' });
    const approved = await Registration.countDocuments({ status: 'approved' });
    const rejected = await Registration.countDocuments({ status: 'rejected' });

    res.json({
      total,
      pending,
      approved,
      rejected
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      message: 'An error occurred while fetching statistics' 
    });
  }
});

// Create initial admin (only for first-time setup)
router.post('/setup', async (req, res) => {
  try {
    console.log('Setup attempt');
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ 
        message: 'Admin already exists' 
      });
    }

    const admin = new Admin({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com'
    });

    await admin.save();
    console.log('Admin created successfully');
    res.status(201).json({ 
      message: 'Admin created successfully' 
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ 
      message: 'An error occurred during admin setup' 
    });
  }
});

// Get evaluations for approved registrations
router.get('/evaluations', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use aggregation to get all data in a single query
    const [evaluations, total] = await Promise.all([
      Registration.aggregate([
        { $match: { status: 'approved' } },
        {
          $lookup: {
            from: 'evaluations',
            localField: '_id',
            foreignField: 'registrationId',
            as: 'evaluation'
          }
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            uid: 1,
            evaluation: { $arrayElemAt: ['$evaluation', 0] }
          }
        },
        { $sort: { 'evaluation.createdAt': -1 } },
        { $skip: skip },
        { $limit: limit }
      ]),
      Registration.countDocuments({ status: 'approved' })
    ]);

    // Create evaluations for registrations that don't have one
    const evaluationsToCreate = evaluations
      .filter(e => !e.evaluation)
      .map(e => ({
        registrationId: e._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (evaluationsToCreate.length > 0) {
      await Evaluation.insertMany(evaluationsToCreate);
    }

    res.json({
      evaluations: evaluations.map(e => ({
        _id: e._id,
        fullName: e.fullName,
        uid: e.uid,
        ...(e.evaluation || {})
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: 'An error occurred while fetching evaluations' });
  }
});

// Update evaluation
router.put('/evaluations/:registrationId', auth, async (req, res) => {
  try {
    const { registrationId } = req.params;
    const updateData = req.body;
    console.log(`Updating evaluation for registration ${registrationId}:`, updateData);

    // Verify registration exists and is approved
    const registration = await Registration.findOne({
      _id: registrationId,
      status: 'approved'
    });

    if (!registration) {
      console.log(`Registration ${registrationId} not found or not approved`);
      return res.status(404).json({ 
        message: 'Approved registration not found' 
      });
    }

    // Update or create evaluation
    const evaluation = await Evaluation.findOneAndUpdate(
      { registrationId },
      updateData,
      { new: true, upsert: true }
    );

    console.log('Evaluation updated successfully:', evaluation);
    res.json(evaluation);
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ 
      message: 'An error occurred while updating evaluation',
      error: error.message 
    });
  }
});

// Export the router
module.exports = router; 
