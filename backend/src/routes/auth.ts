import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

authRouter.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password_hash
            }
        });

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});
