import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';

export const usersRouter = Router();

export interface AuthJwtPayload {
    userId: string;
    username: string;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthJwtPayload;
}

// Middleware to authenticate requests via Bearer JWT
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Malformed authorization header' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as AuthJwtPayload;
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

usersRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, wins: true, losses: true, elo: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
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
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

usersRouter.post('/record-match', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { isWin } = req.body;
        const winBool = Boolean(isWin);

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                wins: winBool ? { increment: 1 } : undefined,
                losses: !winBool ? { increment: 1 } : undefined
            },
            select: { id: true, username: true, wins: true, losses: true }
        });

        res.json(user);
    } catch (error) {
        console.error('Error recording match:', error);
        res.status(500).json({ error: 'Failed to record match result' });
    }
});
