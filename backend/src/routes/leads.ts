import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../utils/adminUtils';

const router = express.Router();

router.use(authMiddleware);

// Listar todos os leads do usuário
router.get('/', async (req, res) => {
    try {
        const { status, search } = req.query;

        // Buscar usuário para checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);

        const where: any = userIsAdmin ? {} : { userId: req.userId };

        if (status && status !== 'todos') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { nome: { contains: search as string, mode: 'insensitive' } },
                { telefone: { contains: search as string } },
                { email: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const leads = await prisma.lead.findMany({
            where,
            include: {
                interacoes: {
                    orderBy: { criadoEm: 'desc' },
                    take: 5
                },
                propostas: true
            },
            orderBy: { criadoEm: 'desc' }
        });

        res.json(leads);
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
        res.status(500).json({ error: 'Erro ao buscar leads' });
    }
});

// Buscar lead específico
router.get('/:id', async (req, res) => {
    try {
        // Buscar usuário para checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);

        const where: any = userIsAdmin
            ? { id: req.params.id }
            : { id: req.params.id, userId: req.userId };

        const lead = await prisma.lead.findFirst({
            where,
            include: {
                interacoes: {
                    orderBy: { criadoEm: 'desc' }
                },
                propostas: true
            }
        });

        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        res.json(lead);
    } catch (error) {
        console.error('Erro ao buscar lead:', error);
        res.status(500).json({ error: 'Erro ao buscar lead' });
    }
});

// Criar novo lead
router.post('/', async (req, res) => {
    try {
        const { nome, telefone, email, idade, cidade, estado, dependentes, origem, valorEstimado, valorPlano, planoDesejado, observacoes } = req.body;

        if (!nome || !telefone || !idade || !cidade) {
            return res.status(400).json({ error: 'Nome, telefone, idade e cidade são obrigatórios' });
        }

        const lead = await prisma.lead.create({
            data: {
                nome,
                telefone,
                email,
                idade: parseInt(idade),
                cidade,
                estado,
                dependentes: parseInt(dependentes) || 0,
                origem: origem || 'manual',
                valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
                valorPlano: valorPlano ? parseFloat(valorPlano) : null,
                planoDesejado,
                observacoes,
                userId: req.userId!,
                status: 'novo'
            }
        });

        await prisma.interacao.create({
            data: {
                tipo: 'criacao',
                descricao: 'Lead criado no sistema',
                leadId: lead.id
            }
        });

        res.status(201).json(lead);
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        res.status(500).json({ error: 'Erro ao criar lead' });
    }
});

// Atualizar lead
router.put('/:id', async (req, res) => {
    try {
        const { nome, telefone, email, idade, cidade, estado, dependentes, valorEstimado, valorPlano, planoDesejado, observacoes } = req.body;

        // Buscar usuário para checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);

        const where: any = userIsAdmin
            ? { id: req.params.id }
            : { id: req.params.id, userId: req.userId };

        const lead = await prisma.lead.updateMany({
            where,
            data: {
                nome,
                telefone,
                email,
                idade: idade ? parseInt(idade) : undefined,
                cidade,
                estado,
                dependentes: dependentes !== undefined ? parseInt(dependentes) : undefined,
                valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
                valorPlano: valorPlano ? parseFloat(valorPlano) : null,
                planoDesejado,
                observacoes
            }
        });

        if (lead.count === 0) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        const leadAtualizado = await prisma.lead.findUnique({
            where: { id: req.params.id },
            include: {
                interacoes: true,
                propostas: true
            }
        });

        res.json(leadAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        res.status(500).json({ error: 'Erro ao atualizar lead' });
    }
});

// Atualizar status do lead
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const statusValidos = ['novo', 'proposta', 'negociacao', 'fechado', 'perdido'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        // Buscar usuário para checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);

        const where: any = userIsAdmin
            ? { id: req.params.id }
            : { id: req.params.id, userId: req.userId };

        const lead = await prisma.lead.updateMany({
            where,
            data: { status }
        });

        if (lead.count === 0) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        await prisma.interacao.create({
            data: {
                tipo: 'status',
                descricao: `Status alterado para: ${status}`,
                leadId: req.params.id
            }
        });

        const leadAtualizado = await prisma.lead.findUnique({
            where: { id: req.params.id },
            include: {
                interacoes: true,
                propostas: true
            }
        });

        res.json(leadAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

// Adicionar interação
router.post('/:id/interacoes', async (req, res) => {
    try {
        const { tipo, descricao } = req.body;

        // Buscar usuário para checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);

        const where: any = userIsAdmin
            ? { id: req.params.id }
            : { id: req.params.id, userId: req.userId };

        const lead = await prisma.lead.findFirst({
            where,
        });

        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        const interacao = await prisma.interacao.create({
            data: {
                tipo,
                descricao,
                leadId: req.params.id
            }
        });

        res.status(201).json(interacao);
    } catch (error) {
        console.error('Erro ao adicionar interação:', error);
        res.status(500).json({ error: 'Erro ao adicionar interação' });
    }
});

// Deletar lead
router.delete('/:id', async (req, res) => {
    try {
        // Buscar usuário para checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);

        const where: any = userIsAdmin
            ? { id: req.params.id }
            : { id: req.params.id, userId: req.userId };

        const lead = await prisma.lead.deleteMany({
            where,
        });

        if (lead.count === 0) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        res.json({ message: 'Lead deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar lead:', error);
        res.status(500).json({ error: 'Erro ao deletar lead' });
    }
});

export default router;