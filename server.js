// File: server.js
// Path: /server.js (root directory)

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import error handling middleware
import { errorLogger, errorHandler, notFoundHandler } from './src/backend/middleware/errorHandler.js';

// Import routes
import authRoutes from './src/backend/routes/authRoutes.js';
import profileRoutes from './src/backend/routes/profileRoutes.js';
import statsRoutes from './src/backend/routes/statsRoutes.js';
import crushRoutes from './src/backend/routes/crushRoutes.js';
import matchRoutes from './src/backend/routes/matchRoutes.js';
import chatRoutes from './src/backend/routes/chatRoutes.js';
import membersRoutes from './src/backend/routes/membersRoutes.js';
import usersRoutes from './src/backend/routes/usersRoutes.js';
import crushAccountRoutes from './src/backend/routes/crushAccountRoutes.js';
import messageRoutes from './src/backend/routes/messageRoutes.js';
import contactRoutes from './src/backend/routes/contactRoutes.js';

// Import webhook handler
import { handleStripeWebhook } from './src/backend/controllers/crushAccountController.js';

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
 handleStripeWebhook
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
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/crushes', crushRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/crush-account', crushAccountRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', contactRoutes);

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