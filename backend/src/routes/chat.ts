import express from 'express';
import { prisma } from '../lib/prisma';
import { chatService } from '../services/chatService';

const router = express.Router();

// Middleware simples para garantir que temos um Broker para atribuir o lead
// Em produção, isso viria do domínio ou de um token público.
// Aqui vamos pegar o PRIMEIRO usuário do banco como "Dono" do site.
// Aqui vamos prioritariamente pegar o usuário 'Thiago' ou o primeiro do banco.
async function getDefaultBroker() { // Retorna o objeto User completo
    // 1. Prioridade Máxima: lcriva@gmail.com
    const primary = await prisma.user.findFirst({
        where: { email: 'lcriva@gmail.com' }
    });
    if (primary) return primary;

    // 2. Fallback: Thiago
    const thiago = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'thiago', mode: 'insensitive' } },
                { nome: { contains: 'Thiago', mode: 'insensitive' } }
            ]
        }
    });
    if (thiago) return thiago;

    // 3. Último recurso: Primeiro usuário do banco
    const first = await prisma.user.findFirst();
    return first;
}

// Iniciar conversa
router.post('/start', async (req, res) => {
    try {
        const broker = await getDefaultBroker();
        if (!broker) {
            console.error('[Chat Route v3.0] ❌ NENHUM CORRETOR ENCONTRADO!');
            return res.status(500).json({ error: 'Nenhum corretor configurado no sistema.' });
        }

        console.log(`[Chat Route v3.0] 🆕 Iniciando chat para Broker: ${broker.nome} (${broker.email}) - ID: ${broker.id}`);
        const leadId = await chatService.createLead(broker.id, 'site_chat');
        console.log(`[Chat Route v3.0] ✅ Lead ${leadId} criado e ATRIBUÍDO a ${broker.nome}`);

        console.log(`[Chat Route v3.0] 🤖 Gerando saudação...`);
        const initialMessage = await chatService.processUserMessage(leadId, "");
        res.json({ leadId, message: initialMessage });
    } catch (error: any) {
        console.error('[Chat Route v3.0] ❌ ERRO CRÍTICO no start:', error);
        res.status(500).json({ error: 'Erro interno', details: error.message });
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
