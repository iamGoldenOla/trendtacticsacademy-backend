/**
 * Vercel Serverless Function entry point.
 */
let app: any;
try {
  app = require('../src/index').default;
} catch (error: any) {
  // If the main app fails to load, serve a diagnostic endpoint
  const express = require('express');
  app = express();
  const errorMessage = error?.message || 'Unknown error';
  const errorStack = error?.stack || '';
  app.use((_req: any, res: any) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: errorMessage,
      stack: errorStack,
    });
  });
}

export default app;
