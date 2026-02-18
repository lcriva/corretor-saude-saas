import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log('🛡️ Auth Middleware - Token received:', token ? 'Yes (Length: ' + token.length + ')' : 'No');

        if (!token) {
            console.log('❌ Token missing in header');
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        console.log('✅ Token valid. User ID:', decoded.userId);
        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error);
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};