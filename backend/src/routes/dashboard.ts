import express from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../utils/adminUtils';

const router = express.Router();

router.use(authMiddleware);

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
                criadoEm: { gte: hoje }
            }
        });

        // Total de leads
        const totalLeads = await prisma.lead.count({
            where: whereUser
        });

        // Propostas enviadas no mês (Leads com status de proposta, negociação ou fechado)
        const propostasEnviadas = await prisma.lead.count({
            where: {
                ...whereUser,
                status: {
                    in: ['proposta', 'negociacao', 'fechado']
                },
                atualizadoEm: { gte: inicioMes }
            }
        });

        // Vendas fechadas no mês
        const vendasFechadas = await prisma.lead.count({
            where: {
                ...whereUser,
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
            novo: await prisma.lead.count({ where: { ...whereUser, status: 'novo' } }),
            proposta: await prisma.lead.count({ where: { ...whereUser, status: 'proposta' } }),
            negociacao: await prisma.lead.count({ where: { ...whereUser, status: 'negociacao' } }),
            fechado: await prisma.lead.count({ where: { ...whereUser, status: 'fechado' } }),
            perdido: await prisma.lead.count({ where: { ...whereUser, status: 'perdido' } })
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
                status: 'negociacao',
                atualizadoEm: { lte: cincoDiasAtras }
            },
            take: 5
        });

        // Leads Leads Frios (Em preenchimento < 100% e status = novo)
        const leadsFrios = await prisma.lead.findMany({
            where: {
                ...whereUser,
                status: 'novo',
                percentualConclusao: { lt: 100 }
            },
            take: 20,
            orderBy: { atualizadoEm: 'desc' }
        });

        // Leads Mornos (100% preenchido mas ainda status = novo, ou seja, viu a proposta mas não fechou/negociou)
        const leadsMornos = await prisma.lead.findMany({
            where: {
                ...whereUser,
                status: 'novo',
                percentualConclusao: 100
            },
            take: 20,
            orderBy: { atualizadoEm: 'desc' }
        });

        // Leads Quentes (Status = negociacao ou fechado recentemente)
        // O usuário pediu "quando o usuário diz que tem interesse em fechar".
        // No whatsapp.ts, quando finaliza, muda status para 'novo' mas 100%. 
        // Vamos ajustar: Se o usuário diz "topo fechar", a IA deve setar finalizado=true.
        // O código atual do whatsapp.ts mantem status 'novo' após finalizar proposta.
        // Vamos considerar 'Morno' como quem completou (100%).
        // Vamos considerar 'Quente' quem explicitamente mudamos o status para 'negociacao' (manual ou IA - precisamos garantir que IA mude para negociação)

        // CORREÇÃO: No whatsapp.ts modifiquei para setar 'finalizado' com 100%.
        // Se a IA finalizar, é um lead que viu preço. É 'Morno'.
        // Se o usuário disser "quero fechar", a IA deveria identificar.
        // Por enquanto, vamos usar a regra:
        // Frio: < 100%
        // Morno: = 100% (Viu preços)
        // Quente: Status = 'negociacao' (Precisa ser setado manualmente ou via IA se ela detectar intenção forte)

        const leadsQuentes = await prisma.lead.findMany({
            where: {
                ...whereUser,
                status: 'negociacao'
            },
            take: 20,
            orderBy: { atualizadoEm: 'desc' }
        });

        res.json({
            leadsFrios,
            leadsMornos,
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