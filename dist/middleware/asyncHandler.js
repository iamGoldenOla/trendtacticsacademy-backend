"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Async handler wrapper to catch errors in async route handlers
 * This eliminates the need for try-catch blocks in every async route handler
 *
 * @param fn - The async function to wrap
 * @returns Express middleware function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
exports.default = exports.asyncHandler;
