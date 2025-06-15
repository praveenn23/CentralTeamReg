const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('./models/Admin');

// Load environment variables
dotenv.config();

// Verify environment variables
console.log('Environment Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('PORT:', process.env.PORT ? '✓ Set' : '✗ Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✓ Set' : '✗ Missing');

// Routes
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Temporarily allow all origins for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/club-registration')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create initial admin user if it doesn't exist
    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const admin = new Admin({
          username: process.env.ADMIN_USERNAME || 'admin',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          email: process.env.ADMIN_EMAIL || 'admin@example.com'
        });
        await admin.save();
        console.log('Initial admin user created successfully');
      }
    } catch (error) {
      console.error('Error creating initial admin:', error);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/registration', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Handle 404
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- POST /api/registration');
  console.log('- GET /api/admin/registrations');
  console.log('- GET /api/admin/evaluations');
  console.log('- PUT /api/admin/evaluations/:registrationId');
}); 