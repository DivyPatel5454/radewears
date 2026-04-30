import next from 'next';
import mongoose from 'mongoose';
import app from './app';
import config from './config/env';
import logger from './utils/logger';
import { errorConverter, errorHandler, AppError } from './middlewares/error';
import { Request, Response } from 'express';

const dev = config.env !== 'production';
// Turbopack is enabled by default in Next.js 16 but causes panic crashes
// that trigger infinite page reload loops on navigation. Force webpack instead.
const nextApp = next({ dev, turbopack: false, webpack: true });
const handle = nextApp.getRequestHandler();

let server: any;

mongoose.connect(config.mongoose.url).then(() => {
  logger.info('Connected to MongoDB');
  nextApp.prepare().then(() => {
    
    // Send back a 404 error for any unknown API request (that is an API route)
  app.all(/^\/v1\/.*/, (req: Request, res: Response, next) => {
    next(new AppError(404, 'API Not found'));
  });

  // Next.js page requests
  app.all(/.*/, (req: Request, res: Response) => {
    return handle(req, res);
  });

  // Convert error to AppError, if needed
  app.use(errorConverter);

  // Handle error for API routes
  app.use(errorHandler);

  server = app.listen(config.port, () => {
    logger.info(`Server listening to port ${config.port} in ${config.env} environment`);
  });

  // VERY IMPORTANT: Forward WebSocket upgrades to Next.js for HMR and Fast Refresh to work!
  server.on('upgrade', (req: any, socket: any, head: any) => {
    nextApp.getUpgradeHandler()(req, socket, head);
  });

  });

}).catch((err) => {
  logger.error('Error starting application', err);
  process.exit(1);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
