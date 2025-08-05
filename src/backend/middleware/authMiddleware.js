// Authentication Middleware
// Path: src/backend/middleware/authMiddleware.js
// Purpose: JWT token verification for protected routes

import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Alias for backward compatibility
export const verifyToken = authenticate;

// Default export
export default authenticate;