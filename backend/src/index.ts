import express from 'express';
import http from 'http';
import cors from 'cors';

import { authRouter } from './routes/auth';
import { questionsRouter } from './routes/questions';
import { usersRouter } from './routes/users';

// Initialize express app
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Mount REST routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/users', usersRouter);

// Create HTTP server
const httpServer = http.createServer(app);

// Start the server
httpServer.listen(4000, () => {
    console.log('🚀 Server ready at http://localhost:4000');
});