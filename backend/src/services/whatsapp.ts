import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason
} from '@whiskeysockets/baileys';

import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { prisma } from '../lib/prisma';
import { chatService } from './chatService';

interface ConversationState {
    userId?: string;
    leadId?: string; // ID do lead no banco
    lastInteraction: number;
    reminded: boolean;
}

// Configurações de tempo (em milissegundos)
const TEMPO_LEMBRETE = 1 * 60 * 1000; // 1 minuto (para teste)
const TEMPO_EXPIRACAO = 2 * 60 * 60 * 1000; // 2 horas

// Estado das conversas em memória


// Estado das conversas em memória
const conversations = new Map<string, ConversationState>();

class WhatsAppService {
    private sock: any = null;
    private qrCodeData: string = '';
    private isConnecting: boolean = false;
    private monitorInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startMonitoring(); // Follow-up reativado
    }


    async conectar(userId?: string) {
        if (this.isConnecting) {
            console.log('⏳ Já está conectando...');
            return;
        }

        try {
            this.isConnecting = true;
            const authPath = process.env.WHATSAPP_AUTH_DIR || 'auth_info';
            const { state, saveCreds } = await useMultiFileAuthState(authPath);

            this.sock = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }),
            });

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('connection.update', (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qrCodeData = qr;
                    console.log('\n📱 QR CODE GERADO!');
                    console.log('═══════════════════════════════════════════');
                    console.log('Abra o WhatsApp no celular:');
                    console.log('1. Menu (⋮) → Dispositivos conectados');
                    console.log('2. Conectar dispositivo');
                    console.log('3. Escaneie o QR Code abaixo:');
                    console.log('═══════════════════════════════════════════\n');

                    // Exibir QR Code no terminal
                    qrcode.generate(qr, { small: true });

                    console.log('\n═══════════════════════════════════════════');
                    console.log('🔒 CONFIGURAÇÕES:');
                    console.log('   Bot conectado: +55 11 96760-9811');
                    console.log('   Autorizado: Todos (Restrição removida)');
                    console.log('   🚫 Ignora mensagens de grupos');
                    console.log('   📧 Coleta email no final da conversa');
                    console.log('═══════════════════════════════════════════\n');
                }

                if (connection === 'close') {
                    this.isConnecting = false;
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                    console.log('❌ Conexão fechada.');
                    console.log('📊 Status Code:', statusCode);
                    console.log('🔄 Reconectando?', shouldReconnect);

                    if (shouldReconnect) {
                        console.log('⏳ Tentando reconectar em 3 segundos...\n');
                        setTimeout(() => this.conectar(userId), 3000);
                    } else {
                        console.log('⚠️  WhatsApp deslogado. Execute o comando novamente para gerar novo QR Code.\n');
                    }
                } else if (connection === 'open') {
                    this.isConnecting = false;
                    console.log('✅ WhatsApp conectado com sucesso!');
                    console.log('🤖 Bot está pronto para receber mensagens!');
                    console.log('📞 Número conectado:', this.sock.user?.id);
                    console.log('🔓 Bot liberado para qualquer número');
                    console.log('🚫 Mensagens de grupos serão ignoradas');
                    console.log('📧 Email será coletado no final da conversa');
                    console.log('═══════════════════════════════════════════\n');
                } else if (connection === 'connecting') {
                    console.log('⏳ Conectando ao WhatsApp...\n');
                }
            });

            // Listener de mensagens
            this.sock.ev.on('messages.upsert', async (m: any) => {
                await this.handleMessage(m, userId);
            });

        } catch (error) {
            this.isConnecting = false;
            console.error('❌ Erro ao conectar WhatsApp:', error);
            throw error;
        }
    }

    private async handleMessage(messageUpdate: any, userId?: string) {
        const message = messageUpdate.messages[0];

        // DEBUG: Logar TUDO que chega para entender o formato
        if (message?.key?.remoteJid) {
            console.log('🔍 Chegou mensagem de:', message.key.remoteJid);
        }

        if (!message.message || message.key.fromMe) {
            return;
        }

        const remoteJid = message.key.remoteJid;

        // ===== OTIMIZAÇÃO: IGNORAR GRUPOS E STATUS IMEDIATAMENTE =====
        // Não logar nada para economizar processamento e limpar o terminal
        if (remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') {
            return;
        }
        // =============================================================

        // ===== RESTRIÇÃO DE PERFORMANCE: APENAS UM NÚMERO =====
        // REMOVIDO: Bot liberado para todos
        // ======================================================

        console.log('DEBUG: handleMessage chamado', JSON.stringify(message.key)); // DEBUG

        const messageText = message.message.conversation ||
            message.message.extendedTextMessage?.text || '';

        console.log(`DEBUG: Processando mensagem de ${remoteJid}: ${messageText}`); // DEBUG

        // ===== RESTRIÇÃO: APENAS NÚMERO +55 11 91577-0166 =====
        // ===== RESTRIÇÃO REMOVIDA: QUALQUER NÚMERO PODE INTERAGIR =====
        console.log(`\n📩 Mensagem recebida:`);
        console.log(`   De: ${remoteJid}`);
        console.log(`   Texto: "${messageText}"\n`);

        // Buscar ou criar estado da conversa
        let conversation = conversations.get(remoteJid);

        if (!conversation) {
            // TENTATIVA DE RECUPERAÇÃO: Verificar se já existe lead ativo no banco
            const leadAtivoId = await this.findActiveLeadId(remoteJid);

            if (leadAtivoId) {
                console.log(`🔄 Sessão recuperada do banco para lead: ${leadAtivoId}`);

                // Buscar dados atuais do lead para contexto (opcional, mas bom para debug)
                const leadDados = await prisma.lead.findUnique({ where: { id: leadAtivoId } });

                conversation = {
                    userId,
                    leadId: leadAtivoId,
                    lastInteraction: Date.now(),
                    reminded: false
                };
                conversations.set(remoteJid, conversation);

            } else {
                // SE NÃO TEM LEAD ATIVO, EXIGE FRASE DE INÍCIO
                // SE NÃO TEM LEAD ATIVO, EXIGE FRASE DE INÍCIO
                const gatilhos = [
                    'oi, quero um plano de saúde',
                    'olá! gostaria de uma cotação do prevent senior.' // Nova frase
                ];

                const msgLimpa = messageText.trim().toLowerCase();
                const ehGatilho = gatilhos.some(g => msgLimpa.includes(g) || msgLimpa === g);

                if (ehGatilho) {
                    // ... (Lógica de start abaixo)
                }

                // Check msg recusas
                if (msgLimpa.includes('não quero continuar') || msgLimpa.includes('cancelar') || msgLimpa.includes('parar')) {
                    console.log(`🚫 Usuário pediu para parar: ${remoteJid}`);
                    await this.enviarMensagem(remoteJid, "Tudo bem, atendimento encerrado. Se mudar de ideia, é só chamar! 👋");

                    // Se tiver lead ativo, marca como perdido
                    const activeLeadId = await this.findActiveLeadId(remoteJid);
                    if (activeLeadId) {
                        await prisma.lead.update({
                            where: { id: activeLeadId },
                            data: { status: 'perdido' }
                        });
                    }
                    return;
                }

                if (!ehGatilho) {
                    // ... (rest of logic)
                    console.log(`ℹ️ Mensagem ignorada (não é a frase de início e sem sessão ativa): "${messageText}"`);

                    // FALLBACK: Avisar o usuário em vez de ignorar
                    await this.enviarMensagem(
                        remoteJid,
                        "Olá! 👋 Como passou um tempo, perdi nossa conexão. Para continuarmos, por favor digite: *Oi, quero um plano de saúde*"
                    );
                    return;
                }

                // INÍCIO DA CONVERSA (CRIAR NOVO)
                const leadId = await this.getOrCreateLead(remoteJid, userId);
                if (!leadId) return;

                conversation = {
                    userId,
                    leadId,
                    lastInteraction: Date.now(),
                    reminded: false
                };
                conversations.set(remoteJid, conversation);

                // Iniciar com mensagem introdutória da State Machine (MarIA)
                // Passamos string vazia para forçar o estado START
                await this.processarResposta(remoteJid, "", conversation);
                return;
            }
        }

        if (conversation) {
            // Atualizar timestamp da última interação
            conversation.lastInteraction = Date.now();
            conversation.reminded = false; // Resetar flag se usuário respondeu

            // Processar resposta
            await this.processarResposta(remoteJid, messageText, conversation);
        }
    }

    private async findActiveLeadId(remoteJid: string): Promise<string | null> {
        const telefone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '');
        try {
            const lead = await prisma.lead.findFirst({
                where: {
                    telefone: telefone,
                    status: { not: 'finalizado' }
                },
                orderBy: { criadoEm: 'desc' }
            });
            return lead ? lead.id : null;
        } catch (error) {
            console.error('Erro ao buscar lead ativo:', error);
            return null;
        }
    }

    private async processarResposta(
        remoteJid: string,
        textoUsuario: string,
        conversation: ConversationState
    ) {
        if (!conversation.leadId) return;

        try {
            await this.sock.sendPresenceUpdate('composing', remoteJid);

            // Usar Máquina de Estados (ChatService) em vez da OpenAI diretamente
            const responseText = await chatService.processUserMessage(conversation.leadId, textoUsuario);

            await this.enviarMensagem(remoteJid, responseText);

            // Se a conversa terminou no ChatService, podemos limpar aqui também se desejar
            // Mas o ChatService já gerencia o estado FINISHED

            console.log(`📤 Resposta enviada via State Machine para ${remoteJid}`);
        } catch (error) {
            console.error('❌ Erro ao processar resposta via State Machine:', error);
            await this.enviarMensagem(remoteJid, "Desculpe, tive um problema técnico ao processar sua mensagem. Vamos tentar de novo?");
        }
    }

    private async getOrCreateLead(remoteJid: string, userId?: string): Promise<string | undefined> {
        const telefone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '');

        try {
            // Tentar encontrar lead em andamento (não finalizado)
            const leadExistente = await prisma.lead.findFirst({
                where: {
                    telefone: telefone,
                    status: { not: 'finalizado' }
                },
                orderBy: { criadoEm: 'desc' }
            });

            if (leadExistente) {
                console.log(`📝 Retomando lead existente: ${leadExistente.id}`);
                return leadExistente.id;
            }

            // Se não, criar novo
            const primeiroUsuario = await prisma.user.findFirst();
            if (!primeiroUsuario) {
                console.error('❌ Erro: Nenhum usuário no sistema para vincular o lead.');
                return undefined;
            }

            const novoLead = await prisma.lead.create({
                data: {
                    telefone,
                    userId: primeiroUsuario.id,
                    status: 'novo',
                    origem: 'whatsapp',
                    percentualConclusao: 10 // Começa com 10% (contato iniciado)
                }
            });
            console.log(`📝 Novo lead criado: ${novoLead.id}`);

            // Criar interação inicial
            await prisma.interacao.create({
                data: {
                    tipo: 'whatsapp',
                    descricao: 'Início de conversa pelo bot (IA)',
                    leadId: novoLead.id
                }
            });

            return novoLead.id;

        } catch (error) {
            console.error('❌ Erro ao buscar/criar lead:', error);
            return undefined;
        }
    }

    async enviarMensagem(numero: string, mensagem: string) {
        try {
            if (!this.sock) {
                throw new Error('WhatsApp não conectado');
            }

            await this.sock.sendMessage(numero, { text: mensagem });
            console.log(`✅ Mensagem enviada para ${numero}`);
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    }

    getQRCode() {
        return this.qrCodeData;
    }

    isConnected() {
        return this.sock?.user !== undefined;
    }

    desconectar() {
        if (this.sock) {
            this.sock.end();
            this.sock = null;
            console.log('❌ WhatsApp desconectado');
        }
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
    }

    private startMonitoring() {
        if (this.monitorInterval) return;

        console.log('⏰ Iniciando monitoramento de inatividade...');

        // Verificar a cada 30 segundos
        this.monitorInterval = setInterval(() => {
            this.checkInactivity();
        }, 30 * 1000);
    }

    private async checkInactivity() {
        // Regras de Tempo (em ms)
        const MSG_15_MIN = 15 * 60 * 1000;
        const MSG_2_HORAS = 2 * 60 * 60 * 1000;
        const LIMITE_2_DIAS = 2 * 24 * 60 * 60 * 1000; // 48h
        const MAX_FOLLOWUPS = 20; // Limite de segurança para não spammar eternamente

        const agora = Date.now();

        for (const [remoteJid, state] of conversations.entries()) {
            if (!this.sock) continue;

            const tempoInativo = agora - state.lastInteraction;

            // Busca lead no banco para saber status real
            let lead = null;
            if (state.leadId) {
                try {
                    lead = await prisma.lead.findUnique({ where: { id: state.leadId } });
                } catch (err) {
                    console.error("Erro ao verificar lead no job:", err);
                    continue;
                }
            }

            // Se não tem lead ou já finalizou/negociacao, remove da memória e segue
            if (!lead || lead.status === 'finalizado' || lead.status === 'negociacao' || lead.status === 'perdido' || lead.percentualConclusao >= 100) {
                if (tempoInativo >= 30 * 60 * 1000) { // 30 min de folga
                    conversations.delete(remoteJid);
                }
                continue;
            }

            // REGRA DE CANCELAMENTO (2 dias sem resposta)
            // Se já mandamos N follow-ups e passou 2 dias desde a criação ou último update...
            // A regra diz: "colocar uma mensagem depois de 2 dias que caso o cliente não deseja prosseguir... encerra"
            const tempoDesdeCriacao = agora - new Date(lead.criadoEm).getTime();

            if (tempoDesdeCriacao >= LIMITE_2_DIAS) {
                // Verifica se já mandamos a mensagem de encerramento
                // Vamos usar uma flag no estado ou verificar se o status já é quase perdido
                // Simplificação: Se passou 2 dias e ainda está 'novo', mandamos msg final e marcamos como perdido.

                console.log(`💀 Lead ${lead.id} expirou (2 dias). Encerrando.`);

                await this.enviarMensagem(
                    remoteJid,
                    "Olá! Como não tivemos mais retorno, estou encerrando seu atendimento por aqui. Caso queira retomar no futuro, é só chamar! 👋"
                );

                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: 'perdido' } // Remove da lista de preenchimento
                });

                conversations.delete(remoteJid);
                continue;
            }

            // LÓGICA DE FOLLOW-UP

            const lastFollowUp = lead.lastFollowUpAt ? new Date(lead.lastFollowUpAt).getTime() : 0;
            const followUpCount = lead.followUpCount || 0;

            // 1º Follow-up: 15 minutos após última interação do LEAD (se count == 0)
            // Lembre: lastInteraction atualiza quando o USER manda msg.
            if (followUpCount === 0) {
                if (tempoInativo >= MSG_15_MIN) {
                    await this.enviarFollowUp(remoteJid, lead.id, 1);
                }
            }
            // Próximos Follow-ups: A cada 2 horas (baseado no último envio de follow-up)
            else if (followUpCount < MAX_FOLLOWUPS) {
                const tempoDesdeUltimoFollowUp = agora - lastFollowUp;

                if (tempoDesdeUltimoFollowUp >= MSG_2_HORAS) {
                    await this.enviarFollowUp(remoteJid, lead.id, followUpCount + 1);
                }
            }
        }
    }

    private async enviarFollowUp(remoteJid: string, leadId: string, count: number) {
        let mensagem = "";

        if (count === 1) {
            mensagem = "Olá! 👋 Ainda está por aí? Falta pouco para sua cotação!";
        } else {
            const opcoes = [
                "Lembrete: Estou aguardando seus dados para calcular o melhor plano! 😉",
                "Quer continuar a cotação? É só responder aqui!",
                "Não esqueça de terminar o preenchimento para ver os valores! 🏥"
            ];
            mensagem = opcoes[Math.floor(Math.random() * opcoes.length)];
        }

        console.log(`⏰ Enviando Follow-up #${count} para ${remoteJid}`);

        try {
            await this.enviarMensagem(remoteJid, mensagem);

            // Atualiza contador no banco
            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    lastFollowUpAt: new Date(),
                    followUpCount: { increment: 1 }
                }
            });
        } catch (error) {
            console.error(`❌ Erro ao enviar follow-up para ${remoteJid}:`, error);
        }
    }
}

// Singleton
let whatsappService: WhatsAppService | null = null;

export const getWhatsAppService = () => {
    if (!whatsappService) {
        whatsappService = new WhatsAppService();
    }
    return whatsappService;
};

export default WhatsAppService;