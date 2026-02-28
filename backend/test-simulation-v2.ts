
import { prisma } from './src/lib/prisma';
import WhatsAppService from './src/services/whatsapp';

// Mock do Socket do Baileys
const mockSock = {
    sendMessage: async (jid: string, content: any) => {
        console.log(`📡 [MOCK SEND] Para: ${jid}, Conteúdo: ${JSON.stringify(content)}`);
        return {};
    },
    sendPresenceUpdate: async () => { },
    chatModify: async (mod: any, jid: string) => {
        console.log(`🏷️ [MOCK LABEL] Mod: ${JSON.stringify(mod)} para ${jid}`);
    }
};

async function simulation() {
    const ws = new (WhatsAppService as any)();
    ws.sock = mockSock; // Injetar mock

    const testPhone = '(11) 98765-4321';
    const realJid = '5511987654321@s.whatsapp.net';
    const maskedJid = '1234567890@lid';

    console.log('\n--- 🧪 INICIANDO SIMULAÇÃO DE CENÁRIOS ROBUSTOS ---\n');

    // Limpar lead de teste anterior se existir
    await prisma.lead.deleteMany({ where: { telefone: testPhone } });

    // 1. Criar um lead 'negociacao' (Atendimento Manual)
    let lead = await prisma.lead.create({
        data: {
            nome: 'Lead em Negociação',
            telefone: testPhone,
            userId: (await prisma.user.findFirst())?.id || '',
            status: 'negociacao',
            percentualConclusao: 50
        }
    });
    console.log(`✅ [1] Lead criado no banco: ${lead.nome} (Status: ${lead.status})`);

    // 2. Simular mensagem de um JID mascarado (@lid)
    console.log('\n🎭 Cenário A: Cliente manda mensagem através de JID mascarado (@lid) enquanto está em negociação');

    // Simular o evento de mensagem resolvendo o JID mascarado via contextInfo.participant
    const msgMasked = {
        messages: [{
            key: { remoteJid: maskedJid, fromMe: false, participant: realJid },
            message: {
                conversation: 'Gostaria de uma informação adicional.',
                contextInfo: { participant: realJid }
            }
        }]
    };

    let respondeu = false;
    ws.enviarMensagem = async () => { respondeu = true; };

    console.log(`➡️ Processando mensagem do JID ${maskedJid}...`);
    await ws.handleMessage(msgMasked);

    if (!respondeu) {
        console.log('✅ SUCESSO: O bot reconheceu o número real e permaneceu em silêncio (status negociação).');
    } else {
        console.log('❌ FALHA: O bot respondeu a um lead em negociação devido a falha na resolução de JID.');
    }

    // 3. Simular mensagem de LEAD FINALIZADO (100%)
    console.log('\n🔕 Cenário B: Lead finalizado (100%) envia mensagem (mesmo com status novo)');
    await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'novo', percentualConclusao: 100 }
    });

    const msgFinalizado = {
        messages: [{
            key: { remoteJid: realJid, fromMe: false },
            message: { conversation: 'Obrigado por tudo.' }
        }]
    };

    respondeu = false;
    await ws.handleMessage(msgFinalizado);

    if (!respondeu) {
        console.log('✅ SUCESSO: O bot permaneceu em silêncio para o lead finalizado (100%).');
    } else {
        console.log('❌ FALHA: O bot enviou mensagem de reconexão para um lead já finalizado.');
    }

    // 4. Teste de Intervenção Humana (fromMe)
    console.log('\n🛠️ Cenário C: Corretor envia mensagem manual');
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'novo', percentualConclusao: 50 } });

    const msgMe = {
        messages: [{
            key: { remoteJid: realJid, fromMe: true },
            message: { conversation: 'Tudo bem, estou te assumindo aqui.' }
        }]
    };

    await ws.handleMessage(msgMe);

    const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
    if (updatedLead?.status === 'negociacao') {
        console.log('✅ SUCESSO: O bot detectou intervenção manual e mudou o status para negociação.');
    } else {
        console.log('❌ FALHA: O bot não mudou o status após mensagem do corretor.');
    }

    console.log('\n--- 🏁 SIMULAÇÃO CONCLUÍDA ---\n');

    // Limpar
    await prisma.lead.deleteMany({ where: { telefone: testPhone } });
}

simulation().catch(console.error);
