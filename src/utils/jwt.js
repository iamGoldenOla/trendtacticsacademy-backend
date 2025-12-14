"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate a JWT token for a user
 * @param user User document
 * @returns JWT token
 */
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
exports.generateToken = generateToken;
/**
 * Verify a JWT token
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
