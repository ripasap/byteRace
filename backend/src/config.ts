import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim() === '') {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
        }
        console.warn('⚠️ WARNING: JWT_SECRET is not set. Using dev fallback. Set JWT_SECRET in your .env file!');
        return 'dev-jwt-secret-do-not-use-in-production';
    }
    return secret;
};

export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    jwtSecret: getJwtSecret(),
    databaseUrl: process.env.DATABASE_URL || '',
    isProduction: process.env.NODE_ENV === 'production'
};
