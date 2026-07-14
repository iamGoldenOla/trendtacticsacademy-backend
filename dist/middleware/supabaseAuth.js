"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instructor = exports.admin = exports.protect = void 0;
const supabase_1 = require("../utils/supabase");
// Supabase authentication middleware
const protect = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        // Extract token
        const token = authHeader.split(' ')[1];
        // Verify token with Supabase
        const { data, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
        // Add user to request object
        req.user = data.user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
exports.protect = protect;
// Admin authorization middleware
const admin = (req, res, next) => {
    // Get user from request (attached by protect middleware)
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as admin' });
    }
    next();
};
exports.admin = admin;
// Instructor authorization middleware
const instructor = (req, res, next) => {
    // Get user from request (attached by protect middleware)
    const user = req.user;
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
        return res.status(403).json({ message: 'Not authorized as instructor' });
    }
    next();
};
exports.instructor = instructor;
