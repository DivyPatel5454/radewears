import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import * as morganConfig from './config/morgan';
import config from './config/env';
import { errorConverter, errorHandler, AppError } from './middlewares/error';
// import { apiLimiter } from './middlewares/rateLimiter';
import routes from './routes';

const app: Express = express();

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors(config.corsOptions));
app.options(/.*/, cors());

// HTTP request logger middleware
if (config.env !== 'test') {
  app.use(morganConfig.successHandler);
  app.use(morganConfig.errorHandler);
}

// Apply rate limiter to all API requests
// app.use('/v1', apiLimiter);

// App API routes v1
app.use('/v1', routes);

// Error handlers are intentionally omitted here to be applied in index.ts
// AFTER the Next.js routes to allow fallback to Next pages.

export default app;
