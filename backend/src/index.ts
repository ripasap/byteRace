import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './routes/auth';
import { questionsRouter } from './routes/questions';
import { usersRouter } from './routes/users';

// Initialize express app
const app = express();

app.use(cors({ 
    origin: function (origin, callback) {
        callback(null, true);
    }, 
    credentials: true 
}));
app.use(express.json());

// Mount REST routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/users', usersRouter);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled express error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server
const httpServer = http.createServer(app);

// Start the server
httpServer.listen(config.port, () => {
    console.log(`🚀 Server ready at http://localhost:${config.port}`);
});