import express from 'express';
import { PrismaClient } from '@prisma/client';
import { chatService } from '../services/chatService';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware simples para garantir que temos um Broker para atribuir o lead
// Em produção, isso viria do domínio ou de um token público.
// Aqui vamos pegar o PRIMEIRO usuário do banco como "Dono" do site.
// Aqui vamos prioritariamente pegar o usuário 'Thiago' ou o primeiro do banco.
async function getDefaultBrokerId() {
    const thiago = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'thiago' } },
                { nome: { contains: 'Thiago' } }
            ]
        }
    });
    if (thiago) return thiago.id;

    const first = await prisma.user.findFirst();
    return first?.id;
}

// Iniciar conversa
router.post('/start', async (req, res) => {
    try {
        const brokerId = await getDefaultBrokerId();
        if (!brokerId) {
            console.error('[Chat Route] ❌ Nenhum corretor encontrado para atribuir o lead!');
            return res.status(500).json({ error: 'Nenhum corretor configurado no sistema.' });
        }

        console.log(`[Chat Route] 🆕 Iniciando chat. Atribuindo ao Broker: ${brokerId}`);
        const leadId = await chatService.createLead(brokerId, 'site_chat');
        console.log(`[Chat Route] ✅ Lead ${leadId} criado com origem 'site_chat'`);

        const initialMessage = await chatService.processUserMessage(leadId, "");
        res.json({ leadId, message: initialMessage });
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
