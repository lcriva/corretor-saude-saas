import express from 'express';
import { PrismaClient } from '@prisma/client';
import { chatService } from '../services/chatService';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware simples para garantir que temos um Broker para atribuir o lead
// Em produção, isso viria do domínio ou de um token público.
// Aqui vamos pegar o PRIMEIRO usuário do banco como "Dono" do site.
async function getDefaultBrokerId() {
    const user = await prisma.user.findFirst();
    return user?.id;
}

// Iniciar conversa
router.post('/start', async (req, res) => {
    try {
        const brokerId = await getDefaultBrokerId();
        if (!brokerId) {
            return res.status(500).json({ error: 'Nenhum corretor configurado no sistema.' });
        }

        const leadId = await chatService.createLead(brokerId, 'site_chat');
        res.json({ leadId, message: "Olá! Sou a Ana, assistente virtual da Corretor Saúde Pro. Como posso ajudar com seu plano de saúde hoje?" });
    } catch (error) {
        console.error('Erro ao iniciar chat:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Enviar mensagem
router.post('/message', async (req, res) => {
    try {
        const { leadId, message } = req.body;

        if (!leadId || !message) {
            return res.status(400).json({ error: 'leadId e message são obrigatórios' });
        }

        const responseText = await chatService.processUserMessage(leadId, message);
        res.json({ text: responseText });

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

export default router;
