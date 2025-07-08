// File: server.js
// Path: /server.js (root directory)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

// Import error handling middleware
const { errorLogger, errorHandler, notFoundHandler } = require('./src/backend/middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
 cors: {
   origin: process.env.CLIENT_URL || 'http://localhost:5173',
   credentials: true
 }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// IMPORTANT: Handle webhook BEFORE body parser
app.post(
 '/api/crush-account/webhook',
 express.raw({ type: 'application/json' }),
 require('./src/backend/controllers/crushAccountController').handleStripeWebhook
);

// Now add body parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug route to check file structure
app.get('/api/debug', (req, res) => {
 const distPath = path.join(__dirname, 'dist');
 const distExists = fs.existsSync(distPath);
 let distContents = [];
 
 if (distExists) {
   distContents = fs.readdirSync(distPath);
 }
 
 res.json({
   cwd: process.cwd(),
   dirname: __dirname,
   distPath: distPath,
   distExists: distExists,
   distContents: distContents,
   nodeEnv: process.env.NODE_ENV
 });
});

// API Routes
app.get('/api/health', (req, res) => {
 res.json({ status: 'OK', message: 'GymCrush API is running' });
});

// Auth routes
app.use('/api/auth', require('./src/backend/routes/authRoutes'));
app.use('/api/profile', require('./src/backend/routes/profileRoutes'));
app.use('/api/stats', require('./src/backend/routes/statsRoutes'));
app.use('/api/crushes', require('./src/backend/routes/crushRoutes'));
app.use('/api/match', require('./src/backend/routes/matchRoutes'));
app.use('/api/chat', require('./src/backend/routes/chatRoutes'));

app.use('/api/members', require('./src/backend/routes/membersRoutes'));
app.use('/api/users', require('./src/backend/routes/usersRoutes'));
app.use('/api/crush-account', require('./src/backend/routes/crushAccountRoutes'));
app.use('/api/messages', require('./src/backend/routes/messageRoutes'));
app.use('/api/contact', require('./src/backend/routes/contactRoutes'));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
 const staticPath = path.join(__dirname, 'dist');
 
 console.log('Production mode - serving static files from:', staticPath);
 console.log('Directory exists:', fs.existsSync(staticPath));
 
 // Serve static files from the React build
 app.use(express.static(staticPath));

 // The "catchall" handler: for any request that doesn't
 // match one above, send back React's index.html file.
 app.get('*', (req, res) => {
   const indexPath = path.join(__dirname, 'dist', 'index.html');
   console.log('Attempting to serve index.html from:', indexPath);
   console.log('File exists:', fs.existsSync(indexPath));
   
   if (fs.existsSync(indexPath)) {
     res.sendFile(indexPath);
   } else {
     res.status(404).json({ 
       error: 'index.html not found', 
       path: indexPath,
       distContents: fs.existsSync(path.join(__dirname, 'dist')) 
         ? fs.readdirSync(path.join(__dirname, 'dist')) 
         : 'dist folder not found'
     });
   }
 });
}

// Error handling middleware - MUST be after all routes
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// MongoDB connection with better error handling
const connectDB = async () => {
 try {
   const mongoUri = process.env.MONGODB_URI;
   
   if (!mongoUri) {
     throw new Error('MONGODB_URI is not defined in environment variables');
   }
   
   console.log('Attempting to connect to MongoDB...');
   
   await mongoose.connect(mongoUri, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     serverSelectionTimeoutMS: 5001,
   });
   
   console.log('MongoDB connected successfully to GymCrush database');
 } catch (err) {
   console.error('MongoDB connection error:', err.message);
   
   // Don't exit in production, let the app run without DB
   if (process.env.NODE_ENV !== 'production') {
     process.exit(1);
   }
 }
};

connectDB();

// Socket.io
io.on('connection', (socket) => {
 console.log('New client connected');
 
 // Join user-specific room for direct messaging
 socket.on('join_user_room', (userId) => {
   socket.join(userId);
   console.log(`User ${userId} joined their room`);
 });
 
 // Handle typing indicators
 socket.on('typing', (data) => {
   socket.to(data.recipientId).emit('user_typing', {
     userId: data.userId
   });
 });
 
 socket.on('disconnect', () => {
   console.log('Client disconnected');
 });
});

// Make io accessible to routes
app.set('io', io);

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  // In production, you might want to gracefully close the server
  httpServer.close(() => {
    process.exit(1);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
 console.log(`GymCrush server running on port ${PORT}`);
 console.log(`Environment: ${process.env.NODE_ENV}`);
 console.log(`Current directory: ${process.cwd()}`);
});