const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const Evaluation = require('../models/Evaluation');
const auth = require('../middleware/auth');

// Test admin route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working' });
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    console.log('Looking for admin with username:', username);
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    console.log('Comparing passwords');
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    console.log('Generating token');
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful');
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    const registrations = await Registration.find()
      .sort({ submittedAt: -1 })
      .select('-terms'); // Exclude terms array from response

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ 
      message: 'An error occurred while fetching registrations' 
    });
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
    console.log('Fetching evaluations...');
    
    // Get all approved registrations
    const approvedRegistrations = await Registration.find({ status: 'approved' });
    console.log(`Found ${approvedRegistrations.length} approved registrations`);

    // Get or create evaluations for each approved registration
    const evaluations = await Promise.all(
      approvedRegistrations.map(async (registration) => {
        let evaluation = await Evaluation.findOne({ registrationId: registration._id });
        
        if (!evaluation) {
          console.log(`Creating new evaluation for registration ${registration._id}`);
          evaluation = new Evaluation({ registrationId: registration._id });
          await evaluation.save();
        }

        return {
          _id: registration._id,
          fullName: registration.fullName,
          uid: registration.uid,
          ...evaluation.toObject()
        };
      })
    );

    console.log(`Returning ${evaluations.length} evaluations`);
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ 
      message: 'An error occurred while fetching evaluations',
      error: error.message 
    });
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

module.exports = router; 