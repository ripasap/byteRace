import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export const usersRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware to authenticate
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

usersRouter.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const { userId } = (req as any).user;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, wins: true, losses: true, elo: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

usersRouter.get('/leaderboard', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { wins: 'desc' },
            take: 10,
            select: { id: true, username: true, wins: true, losses: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

usersRouter.post('/record-match', authenticate, async (req: Request, res: Response) => {
    try {
        const { userId } = (req as any).user;
        const { isWin } = req.body;
        
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                wins: isWin ? { increment: 1 } : undefined,
                losses: !isWin ? { increment: 1 } : undefined
            },
            select: { wins: true, losses: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to record match' });
    }
});
