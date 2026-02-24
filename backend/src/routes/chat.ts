import express from 'express';
import { prisma } from '../lib/prisma';
import { chatService } from '../services/chatService';

const router = express.Router();

// Pegar o corretor padrão para atribuir o lead
async function getDefaultBroker() {
    const primary = await prisma.user.findFirst({ where: { email: 'lcriva@gmail.com' } });
    if (primary) return primary;

    const thiago = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'thiago', mode: 'insensitive' } },
                { nome: { contains: 'Thiago', mode: 'insensitive' } },
            ],
        },
    });
    if (thiago) return thiago;

    return await prisma.user.findFirst();
}

// POST /api/chat/start — Iniciar conversa
router.post('/start', async (req, res) => {
    try {
        const broker = await getDefaultBroker();
        if (!broker) {
            return res.status(500).json({ error: 'Nenhum corretor configurado no sistema.' });
        }

        const leadId = await chatService.createLead(broker.id, 'site_chat');
        const response = await chatService.processUserMessage(leadId, '');

        res.json({ leadId, message: response.text, buttons: response.buttons ?? [] });
    } catch (error: any) {
        console.error('[Chat Route v4.0] ❌ ERRO no start:', error);
        res.status(500).json({ error: 'Erro interno', details: error.message });
    }
});

// POST /api/chat/message — Enviar mensagem
router.post('/message', async (req, res) => {
    try {
        const { leadId, message } = req.body;

        if (!leadId || !message) {
            return res.status(400).json({ error: 'leadId e message são obrigatórios' });
        }

        const response = await chatService.processUserMessage(leadId, message);
        res.json({ text: response.text, buttons: response.buttons ?? [] });
    } catch (error) {
        console.error('[Chat Route v4.0] Erro ao processar mensagem:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

export default router;
