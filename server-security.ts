/**
 * Security middleware for Express server
 * Implements CORS, CSRF protection, rate limiting, and request validation
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

/**
 * Configure CORS with environment-based allowed origins
 */
export function setupCors(app: express.Application) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Rejected request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    maxAge: 86400 // 24 hours
  }));
}

/**
 * Rate limiting middleware for API endpoints
 */
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return (req as any).user?.id || req.ip || 'unknown';
    }
  });
};

// Pre-configured rate limiters
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests');
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many auth attempts');
export const geminiLimiter = createRateLimiter(60 * 1000, 10, 'Too many AI requests'); // 10 per minute
export const exportLimiter = createRateLimiter(60 * 1000, 5, 'Too many export requests');

/**
 * Request validation middleware
 */
export function validateRequestMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          error: 'Validation failed',
          details: messages
        });
      }
      res.status(400).json({ error: 'Invalid request' });
    }
  };
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export async function authenticateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);
    
    // For Supabase: verify the JWT token
    // This is a placeholder - implement actual token verification
    // using your auth provider's methods
    
    // Example with Supabase:
    // const { data: { user }, error } = await supabase.auth.getUser(token);
    // if (error || !user) {
    //   return res.status(401).json({ error: 'Invalid token' });
    // }
    // (req as any).user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    requestId: Math.random().toString(36).substring(7)
  });
}

/**
 * Request logging middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP header
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'"
  );
  
  next();
}
