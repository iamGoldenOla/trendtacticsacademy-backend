/**
 * Vercel Serverless Function entry point.
 * Imports the Express app and re-exports it so Vercel can handle routing.
 */
import app from '../src/index';

export default app;
