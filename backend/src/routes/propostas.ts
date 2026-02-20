import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// Listar propostas do usuário
router.get('/', async (req, res) => {
    try {
        const propostas = await prisma.proposta.findMany({
            where: { userId: req.userId },
            include: {
                lead: {
                    select: {
                        id: true,
                        nome: true,
                        telefone: true
                    }
                }
            },
            orderBy: { criadoEm: 'desc' }
        });

        res.json(propostas);
    } catch (error) {
        console.error('Erro ao buscar propostas:', error);
        res.status(500).json({ error: 'Erro ao buscar propostas' });
    }
});

// Criar proposta para um lead
router.post('/', async (req, res) => {
    try {
        const { leadId, operadora, plano, valor, cobertura } = req.body;

        if (!leadId || !operadora || !plano || !valor) {
            return res.status(400).json({ error: 'leadId, operadora, plano e valor são obrigatórios' });
        }

        const lead = await prisma.lead.findFirst({
            where: {
                id: leadId,
                userId: req.userId
            }
        });

        if (!lead) {
            return res.status(404).json({ error: 'Lead não encontrado' });
        }

        const proposta = await prisma.proposta.create({
            data: {
                operadora,
                plano,
                valor: parseFloat(valor),
                cobertura,
                leadId,
                userId: req.userId!
            }
        });

        await prisma.interacao.create({
            data: {
                tipo: 'proposta',
                descricao: `Proposta ${operadora} - ${plano} criada (R$ ${valor})`,
                leadId
            }
        });

        res.status(201).json(proposta);
    } catch (error) {
        console.error('Erro ao criar proposta:', error);
        res.status(500).json({ error: 'Erro ao criar proposta' });
    }
});

// Marcar proposta como enviada
router.patch('/:id/enviar', async (req, res) => {
    try {
        const proposta = await prisma.proposta.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (!proposta) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const propostaAtualizada = await prisma.proposta.update({
            where: { id: req.params.id },
            data: { enviada: true }
        });

        await prisma.lead.update({
            where: { id: proposta.leadId },
            data: { status: 'proposta' }
        });

        await prisma.interacao.create({
            data: {
                tipo: 'email',
                descricao: 'Proposta enviada ao cliente',
                leadId: proposta.leadId
            }
        });

        res.json(propostaAtualizada);
    } catch (error) {
        console.error('Erro ao enviar proposta:', error);
        res.status(500).json({ error: 'Erro ao enviar proposta' });
    }
});

// Marcar proposta como aceita
router.patch('/:id/aceitar', async (req, res) => {
    try {
        const proposta = await prisma.proposta.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (!proposta) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const propostaAtualizada = await prisma.proposta.update({
            where: { id: req.params.id },
            data: { aceita: true }
        });

        await prisma.lead.update({
            where: { id: proposta.leadId },
            data: { status: 'fechado' }
        });

        await prisma.interacao.create({
            data: {
                tipo: 'venda',
                descricao: `Venda fechada! ${proposta.operadora} - ${proposta.plano}`,
                leadId: proposta.leadId
            }
        });

        res.json(propostaAtualizada);
    } catch (error) {
        console.error('Erro ao aceitar proposta:', error);
        res.status(500).json({ error: 'Erro ao aceitar proposta' });
    }
});

// Deletar proposta
router.delete('/:id', async (req, res) => {
    try {
        const proposta = await prisma.proposta.deleteMany({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (proposta.count === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        res.json({ message: 'Proposta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar proposta:', error);
        res.status(500).json({ error: 'Erro ao deletar proposta' });
    }
});

export default router;