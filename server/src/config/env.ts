import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ ...({ quiet: true } as any) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/radhewears'),
  JWT_SECRET: z.string().default('CHANGE_THIS_TO_A_STRONG_SECRET'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string().default(''),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('Environment variable validation error:', envVars.error.format());
  process.exit(1);
}

const config = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  mongoose: {
    url: envVars.data.MONGODB_URI,
  },
  corsOptions: {
    origin: envVars.data.CORS_ORIGIN,
  },
};

export default config;
