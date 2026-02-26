import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../utils/adminUtils';

const router = express.Router();

router.use(authMiddleware);

// Filtro comum para leads válidos (WhatsApp + Nome ou Idade)
const validLeadFilter = {
    telefone: { notIn: ['', 'Aguardando...'] },
    OR: [
        { idade: { not: null } },
        {
            AND: [
                { nome: { not: null } },
                { nome: { not: { startsWith: 'Visitante' } } },
                { nome: { not: { startsWith: 'WhatsApp' } } }
            ]
        }
    ]
};

// Estatísticas gerais do dashboard
router.get('/stats', async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        // Checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);
        const whereUser: any = userIsAdmin ? {} : { userId: req.userId };

        // Leads criados hoje
        const leadsHoje = await prisma.lead.count({
            where: {
                ...whereUser,
                ...validLeadFilter,
                criadoEm: { gte: hoje }
            }
        });

        // Total de leads
        const totalLeads = await prisma.lead.count({
            where: {
                ...whereUser,
                ...validLeadFilter
            }
        });

        // Propostas enviadas no mês (Leads com status de negociação ou fechado)
        const propostasEnviadas = await prisma.lead.count({
            where: {
                ...whereUser,
                ...validLeadFilter,
                status: {
                    in: ['negociacao', 'fechado']
                },
                atualizadoEm: { gte: inicioMes }
            }
        });

        // Vendas fechadas no mês
        const vendasFechadas = await prisma.lead.count({
            where: {
                ...whereUser,
                ...validLeadFilter,
                status: 'fechado',
                atualizadoEm: { gte: inicioMes }
            }
        });

        // Taxa de conversão
        const taxaConversao = propostasEnviadas > 0
            ? parseFloat(((vendasFechadas / propostasEnviadas) * 100).toFixed(1))
            : 0;

        // Receita estimada (comissão de 10% sobre vendas fechadas)
        // Prioriza valorPlano, se não tiver usa valorEstimado
        const vendasComValor = await prisma.lead.findMany({
            where: {
                ...whereUser,
                ...validLeadFilter,
                status: 'fechado',
                atualizadoEm: { gte: inicioMes },
                OR: [
                    { valorPlano: { not: null } },
                    { valorEstimado: { not: null } }
                ]
            },
            select: { valorPlano: true, valorEstimado: true }
        });

        const receitaMes = vendasComValor.reduce((acc, lead) => {
            const valor = lead.valorPlano || lead.valorEstimado || 0;
            return acc + valor; // Comissão de 100% (valor total da primeira mensalidade)
        }, 0);

        // Pipeline
        const pipeline = {
            novo: await prisma.lead.count({ where: { ...whereUser, ...validLeadFilter, status: 'novo' } }),
            negociacao: await prisma.lead.count({ where: { ...whereUser, ...validLeadFilter, status: 'negociacao' } }),
            fechado: await prisma.lead.count({ where: { ...whereUser, ...validLeadFilter, status: 'fechado' } }),
            perdido: await prisma.lead.count({ where: { ...whereUser, ...validLeadFilter, status: 'perdido' } })
        };

        res.json({
            leadsHoje,
            totalLeads,
            propostasEnviadas,
            vendasFechadas,
            taxaConversao,
            receitaMes: Math.round(receitaMes),
            pipeline
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// Atividades recentes
router.get('/atividades', async (req, res) => {
    try {
        // Checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);
        const whereUser: any = userIsAdmin ? {} : { userId: req.userId };

        const interacoes = await prisma.interacao.findMany({
            where: {
                lead: whereUser
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        nome: true,
                        status: true
                    }
                }
            },
            orderBy: { criadoEm: 'desc' },
            take: 10
        });

        res.json(interacoes);
    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
});

// Leads que precisam de atenção (IA suggestions)
router.get('/alertas', async (req, res) => {
    try {
        const hoje = new Date();
        const tresDiasAtras = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000);

        // Checar se é admin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const userIsAdmin = isAdmin(user?.email);
        const whereUser: any = userIsAdmin ? {} : { userId: req.userId };

        // Leads novos sem interação há 3 dias
        const leadsSemInteracao = await prisma.lead.findMany({
            where: {
                ...whereUser,
                status: 'novo',
                criadoEm: { lte: tresDiasAtras }
            },
            take: 5
        });

        // Propostas enviadas sem resposta há mais de 2 dias
        const doisDiasAtras = new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000);
        const propostasSemResposta = await prisma.proposta.findMany({
            where: {
                ...whereUser,
                enviada: true,
                aceita: false,
                criadoEm: { lte: doisDiasAtras }
            },
            include: {
                lead: true
            },
            take: 5
        });

        // Leads em negociação há mais de 5 dias
        const cincoDiasAtras = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000);
        const negociacoesParadas = await prisma.lead.findMany({
            where: {
                ...whereUser,
                ...validLeadFilter,
                status: 'negociacao',
                atualizadoEm: { lte: cincoDiasAtras }
            },
            take: 5
        });

        // Leads Frios (Em preenchimento < 100%)
        const leadsFrios = await prisma.lead.findMany({
            where: {
                ...whereUser,
                ...validLeadFilter,
                percentualConclusao: { lt: 100 },
                NOT: { status: 'fechado' } // Não mostrar fechados aqui
            },
            take: 20,
            orderBy: { atualizadoEm: 'desc' }
        });

        // Leads Quentes (100% preenchido — Independente do status)
        const combinedQuentes = await prisma.lead.findMany({
            where: {
                ...whereUser,
                ...validLeadFilter,
                percentualConclusao: 100,
                NOT: { status: 'fechado' } // Não mostrar fechados aqui
            },
            take: 50,
            orderBy: { atualizadoEm: 'desc' }
        });

        // Ordenação por urgência: "Hoje" > "Esta Semana" > "Sem Urgência" > null
        const leadsQuentes = combinedQuentes.sort((a, b) => {
            const priority: any = { 'Hoje': 1, 'Esta Semana': 2, 'Sem Urgência': 3 };
            const pA = priority[a.urgencia || ''] || 99;
            const pB = priority[b.urgencia || ''] || 99;
            return pA - pB;
        });

        res.json({
            leadsFrios,
            leadsQuentes,
            leadsSemInteracao,
            propostasSemResposta,
            negociacoesParadas,
            // Mantendo compatibilidade caso fronte use, mas vamos remover do front
            leadsEmPreenchimento: leadsFrios
        });
    } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        res.status(500).json({ error: 'Erro ao buscar alertas' });
    }
});

export default router;