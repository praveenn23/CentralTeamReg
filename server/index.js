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
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Keep permissive for now to rule out CORS issues
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Re-add static files

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Request: ${req.method} ${req.url}`);
  // console.log('Request Headers:', req.headers); // Comment out verbose logging for now
  // console.log('Request Body:', req.body); // Comment out verbose logging for now
  next();
});

// Routes
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');

// Mount routes with explicit paths
app.use('/api/registration', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Basic root route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.send('Backend root is working!');
});

// Test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'API is working' });
});

// Health check route
app.get('/health', (req, res) => {
  console.log('Health check route hit');
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    routes: {
      admin: '/api/admin',
      registration: '/api/registration',
      test: '/api/test',
      health: '/health',
      root: '/'
    }
  });
});

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
    method: req.method,
    availableRoutes: [
      '/api/test',
      '/health',
      '/api/admin/login',
      '/api/admin/test',
      '/api/registration',
      '/'
    ]
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/club-registration', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /');
  console.log('- GET /api/test');
  console.log('- GET /health');
  console.log('- POST /api/admin/login');
  console.log('- GET /api/admin/test');
  console.log('- POST /api/registration');
}); 