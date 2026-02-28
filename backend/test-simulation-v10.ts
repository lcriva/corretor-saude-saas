
import { prisma } from './src/lib/prisma';
import WhatsAppService from './src/services/whatsapp';

// Mock do Socket do Baileys
const mockSock = {
    sendMessage: async (jid: string, content: any) => {
        const id = 'BOT_MSG_' + Math.random().toString(36).substring(7);
        return { key: { id, remoteJid: jid, fromMe: true } };
    },
    sendPresenceUpdate: async () => { },
    chatModify: async (mod: any, jid: string) => { }
};

async function simulationV10() {
    const ws: any = new (WhatsAppService as any)();
    ws.sock = mockSock;

    const testPhone = '(11) 94444-3333';
    const realJid = '5511944443333@s.whatsapp.net';

    console.log('\n--- 🧪 INICIANDO SIMULAÇÃO V10: SILÊNCIO PARA "OI" EM LEADS FINALIZADOS ---\n');

    // 1. Criar um lead já finalizado no banco
    await prisma.lead.deleteMany({ where: { telefone: testPhone } });
    await prisma.lead.create({
        data: {
            telefone: testPhone,
            nome: 'Lead Blindado',
            status: 'negociacao',
            percentualConclusao: 100,
            origem: 'whatsapp',
            userId: (await prisma.user.findFirst())?.id || ""
        }
    });

    let respondeuText = "NADA";
    ws.enviarMensagem = async (jid: string, text: string) => {
        respondeuText = text;
        console.log(`📡 [BOT SENT] Msg: ${text.substring(0, 40)}...`);
    };

    // 2. Cliente envia "Oi" (sem sessão ativa, mas lead conhecido no banco)
    console.log(`\n[1] Cliente (Finalizado) envia "Oi"`);
    respondeuText = "NADA";
    await ws.handleMessage({
        messages: [{
            key: { remoteJid: realJid, fromMe: false },
            message: { conversation: 'Oi' }
        }]
    });

    if (respondeuText === "NADA") {
        console.log('✅ SUCESSO: Bot ignorou o "Oi" para lead finalizado.');
    } else {
        console.log(`❌ FALHA: Bot respondeu: "${respondeuText}"`);
    }

    // 3. Cliente envia "Oi" de um número DESCONHECIDO (bot deve ignorar também, não é gatilho)
    const unknownJid = '5511911112222@s.whatsapp.net';
    console.log(`\n[2] Cliente DESCONHECIDO envia "Oi"`);
    respondeuText = "NADA";
    await ws.handleMessage({
        messages: [{
            key: { remoteJid: unknownJid, fromMe: false },
            message: { conversation: 'Oi' }
        }]
    });

    if (respondeuText === "NADA") {
        console.log('✅ SUCESSO: Bot ignorou "Oi" de desconhecido.');
    } else {
        console.log(`❌ FALHA: Bot respondeu para desconhecido: "${respondeuText}"`);
    }

    // 4. Cliente envia GATILHO REAL (Deve funcionar)
    console.log(`\n[3] Cliente envia GATILHO real`);
    respondeuText = "NADA";
    await ws.handleMessage({
        messages: [{
            key: { remoteJid: realJid, fromMe: false },
            message: { conversation: 'Quero um plano de saude' }
        }]
    });

    if (respondeuText.includes("Seja bem-vindo")) {
        console.log('✅ SUCESSO: Gatilho real ressuscitou o bot.');
    } else {
        console.log('❌ FALHA: Bot não respondeu ao gatilho real.');
    }

    console.log('\n--- 🏁 SIMULAÇÃO V10 CONCLUÍDA ---\n');
    await prisma.lead.deleteMany({ where: { telefone: testPhone } });
}

simulationV10().catch(console.error);
