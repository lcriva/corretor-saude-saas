import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Registro de novo usuário
router.post('/register', async (req, res) => {
    try {
        const { email, senha, nome, telefone } = req.body;

        if (!email || !senha || !nome) {
            return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
        }

        const usuarioExistente = await prisma.user.findUnique({
            where: { email }
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const user = await prisma.user.create({
            data: {
                email,
                senha: senhaHash,
                nome,
                telefone,
                plano: 'free'
            }
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                plano: user.plano
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login attempt:', req.body.email);
        const { email, senha } = req.body;

        if (!email || !senha) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        console.log('✅ User found, checking password...');
        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        console.log('✅ Password valid, generating token...');

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                plano: user.plano
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Verificar token
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                nome: true,
                telefone: true,
                plano: true,
                criadoEm: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

export default router;