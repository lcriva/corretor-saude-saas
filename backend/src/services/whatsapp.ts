import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { prisma } from '../lib/prisma';
import { chatService, ChatStep } from './chatService';

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
const conversations = new Map<string, ConversationState>();

// Últimos botões enviados por conversa (para traduzir número → label)
const lastButtons = new Map<string, string[]>();

// Mapa de etiquetas do WhatsApp (Nome -> ID)
const whatsappLabels = new Map<string, string>();

// IDs de mensagens enviadas pelo bot (para distinguir de intervenção manual)
const botSentMessageIds = new Set<string>();

class WhatsAppService {
    private sock: any = null;
    private qrCodeData: string = '';
    private isConnecting: boolean = false;
    private monitorInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startMonitoring();
    }

    private getCanonicalJid(jid: string): string {
        const raw = jid.replace(/@s\.whatsapp\.net|@c\.us|@lid/g, '').replace(/\D/g, '');
        let digits = raw.startsWith('55') ? raw.slice(2) : raw;
        // Se tem 11 dígitos e o terceiro é 9, remove o 9 (BR 9th digit) para lookup interno
        if (digits.length === 11 && digits[2] === '9') {
            digits = digits.slice(0, 2) + digits.slice(3);
        }
        return `55${digits}@s.whatsapp.net`;
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

            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`📱 Usando protocolo WhatsApp versão ${version.join('.')} (mais recente: ${isLatest})`);

            this.sock = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }),
                version,
            });

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('connection.update', (update: any) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qrCodeData = qr;
                    console.log('\n📱 QR CODE GERADO!');
                    qrcode.generate(qr, { small: true });
                }

                if (connection === 'close') {
                    this.isConnecting = false;
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const isFatal = statusCode === 405 || statusCode === DisconnectReason.loggedOut;
                    const shouldReconnect = !isFatal;

                    if (shouldReconnect) {
                        setTimeout(() => this.conectar(userId), 5000);
                    }
                } else if (connection === 'open') {
                    this.isConnecting = false;
                    console.log('✅ WhatsApp conectado com sucesso!');
                    this.fetchLabels().catch(err => console.error('❌ Erro ao buscar etiquetas:', err));
                }
            });

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
        if (!message.message) return;

        const remoteJid = message.key.remoteJid;
        if (remoteJid?.endsWith('@g.us') || remoteJid === 'status@broadcast') return;

        // ── 0. RESOLUÇÃO DE JID REAL (IMEDIATA) ─────────────────────────────
        let realJid = remoteJid;
        if (remoteJid.endsWith('@lid')) {
            // Buscamos o JID real (@s.whatsapp.net) em todas as localizações possíveis do objeto Baileys
            const participant =
                message.key?.participant ||
                message.participant ||
                message.message?.contextInfo?.participant ||
                message.message?.extendedTextMessage?.contextInfo?.participant ||
                message.message?.imageMessage?.contextInfo?.participant ||
                message.message?.audioMessage?.contextInfo?.participant ||
                message.message?.videoMessage?.contextInfo?.participant ||
                message.message?.documentMessage?.contextInfo?.participant;

            if (participant && participant.endsWith('@s.whatsapp.net')) {
                realJid = participant;
                console.log(`   💡 ID Mascarado (@lid) resolvido para: ${realJid}`);
            }
        }

        // ── 1. BUSCA DE LEAD ATIVO (O MAIS CEDO POSSÍVEL) ────────────────────
        const canonicalJid = this.getCanonicalJid(realJid);
        const activeLeadId = await this.findActiveLeadId(realJid); // Mantém a busca flexível no DB
        const lead = activeLeadId ? await prisma.lead.findUnique({ where: { id: activeLeadId } }) : null;
        if (!lead) console.log(`🔍 [WA] Lead não encontrado para JID: ${realJid} (Canonical: ${canonicalJid})`);
        else console.log(`🔍 [WA] Lead encontrado: ${lead.nome} (${lead.id}) - JID: ${realJid} (Canonical: ${canonicalJid})`);

        // ── 2. PROCESSAMENTO TEXTUAL INICIAL (PARA GATILHOS/RESTART) ──────────
        const messageText = message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption || '';

        const normalizar = (t: string) => t.trim().toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ');

        const msgLimpaOriginal = normalizar(messageText);
        const gatilhos = [
            'quero um plano de saude',
            'cotacao prevent senior',
            'simular plano prevent senior',
            'ola gostaria de uma cotacao',
            'gostaria de uma simulacao'
        ];

        // ehGatilho agora é mais estrito: a mensagem deve CONTER o gatilho, mas "oi" sozinho não é gatilho
        const ehGatilho = gatilhos.some(g => msgLimpaOriginal.includes(g)) || msgLimpaOriginal === 'comecar' || msgLimpaOriginal === 'simular';
        const isRestart = msgLimpaOriginal === 'recomecar' || msgLimpaOriginal === 'restart' || msgLimpaOriginal === 'voltar ao inicio';

        // ── 3. DETECÇÃO DE INTERVENÇÃO / SILÊNCIO (MODO SESSÃO) ──────────────

        // ── 3. DETECÇÃO DE SILÊNCIO E INTERVENÇÃO ───────────────────────────

        // 3.1. Se for mensagem do próprio bot (fromMe), verificamos se é automatizada ou manual
        if (message.key.fromMe) {
            const msgId = message.key.id;
            // Se o ID está no nosso Set, foi o bot quem mandou. Apenas limpamos o Set.
            if (msgId && botSentMessageIds.has(msgId)) {
                botSentMessageIds.delete(msgId);
                return;
            }
            // Se NÃO está no Set, foi uma intervenção manual do corretor no celular/web
            if (lead && lead.status === 'novo') {
                console.log(`   🛠️ Intervenção humana MANUAL detectada para ${lead.nome}. Bot silenciado.`);
                await prisma.lead.update({ where: { id: lead.id }, data: { status: 'negociacao' } });
            }
            conversations.delete(canonicalJid);
            return;
        }

        // 3.2. Se for Gatilho ou Restart (bypass total de silêncio para permitir recomeçar)
        if (ehGatilho || isRestart) {
            console.log(`   🚀 Gatilho ou Restart detectado. Bypassing silêncio e resetando lead.`);
            conversations.delete(canonicalJid);
            if (activeLeadId) {
                await prisma.lead.update({
                    where: { id: activeLeadId },
                    data: { status: 'novo', percentualConclusao: 10, lastFollowUpAt: null, followUpCount: 0 }
                }).catch(() => { });
                chatService.resetSession(activeLeadId);
            }
            // Continua para o fluxo normal de saudação
        } else {
            // 3.3. REGRAS DE SILÊNCIO (CONVERSA MANUAL OU FINALIZADA)
            const isFinishedOrManual = lead && (lead.status !== 'novo' || lead.percentualConclusao >= 100);
            const hasActiveSession = conversations.has(canonicalJid);

            // CURA DE SESSÃO: Se o servidor reiniciou ou se a sessão em memória sumiu,
            // garantimos que o estado do bot condiz com o database para leads de Outbound.
            const session = lead ? await chatService.getOrCreateSession(lead.id) : null;
            const isOutboundInteract = session?.step === ChatStep.OUTBOUND_OPCOES;

            if (lead?.lastButtons && (!hasActiveSession || !lastButtons.has(canonicalJid))) {
                const buttons = lead.lastButtons as string[];
                if (buttons.includes('Tirar Dúvidas') && buttons.includes('Continuar a Contratação')) {
                    console.log(`🩹 [Healing] Sincronizando memória para lead de Outbound: ${lead.nome || lead.id}`);
                    if (!hasActiveSession) this.registrarSessaoAtiva(realJid, lead.id, buttons);
                    if (!lastButtons.has(canonicalJid)) lastButtons.set(canonicalJid, buttons);
                    if (session && session.step !== ChatStep.OUTBOUND_OPCOES) session.step = ChatStep.OUTBOUND_OPCOES;
                }
            }

            const isOutboundInteract = session?.step === ChatStep.OUTBOUND_OPCOES;

            console.log(`   🔎 [SilenceCheck] Lead: ${lead?.nome || '?'}, Finished/Manual: ${isFinishedOrManual}, HasSession: ${hasActiveSession}, OutboundStep: ${isOutboundInteract}`);

            if (isFinishedOrManual && !hasActiveSession && !isOutboundInteract) {
                console.log(`   🔕 Lead ${lead ? lead.nome : 'desconhecido'} silenciado. Motivo: Regra 100%/Manual.`);
                return;
            }

            // B) Silêncio para mídias (fotos/áudios) fora de um fluxo ativo
            // Importante: Silencia mesmo que o lead não seja encontrado, para evitar responder "perdi conexão" para imagens
            const isMedia = !!(message.message?.imageMessage || message.message?.videoMessage || message.message?.audioMessage || message.message?.documentMessage || message.message?.stickerMessage);
            if (isMedia && !hasActiveSession) {
                if (lead && lead.status === 'novo') {
                    console.log(`   📸 Mídia detectada no início. Silenciando bot para não atrapalhar o humano.`);
                    await prisma.lead.update({
                        where: { id: lead.id },
                        data: { status: 'negociacao', observacoes: (lead.observacoes || '') + '\n[Sistema] Cliente enviou mídia - bot silenciado' }
                    });
                } else if (!lead) {
                    console.log(`   📸 Mídia de desconhecido detectada. Mantendo silêncio.`);
                }
                return;
            }
        }

        const isAudio = !!message.message?.audioMessage;
        console.log(`\n📩 [WA] Mensagem de ${remoteJid}${realJid !== remoteJid ? ` (${realJid})` : ''}: "${messageText}"`);

        // ── 4. RECUPERAÇÃO DE SESSÃO / LEAD (IMEDIATA) ─────────────────────
        let conversation = conversations.get(canonicalJid);
        if (!conversation) {
            if (activeLeadId) {
                const leadDados = await prisma.lead.findUnique({ where: { id: activeLeadId } });
                if (leadDados?.lastButtons && Array.isArray(leadDados.lastButtons)) {
                    lastButtons.set(canonicalJid, leadDados.lastButtons as string[]);
                }
                conversation = { userId, leadId: activeLeadId, lastInteraction: Date.now(), reminded: false };
                conversations.set(canonicalJid, conversation);
            }
        }

        // ── 5. TRADUÇÃO DE NÚMERO → LABEL DE BOTÃO ─────────────────────────────
        const botoesAtivos = lastButtons.get(canonicalJid) ?? [];
        const textoLimpo = messageText.trim().replace(/[️⃣.\)\-]/g, '').trim();
        const numeroDigitado = parseInt(textoLimpo, 10);
        let textoFinal = messageText;

        if (botoesAtivos.length > 0 && !isNaN(numeroDigitado) && numeroDigitado >= 1 && numeroDigitado <= botoesAtivos.length && textoLimpo === String(numeroDigitado)) {
            textoFinal = botoesAtivos[numeroDigitado - 1];
            console.log(`   🔢 Número ${numeroDigitado} traduzido para: "${textoFinal}"`);
        }

        const msgLimpa = normalizar(textoFinal);
        const isRestartFinal = msgLimpa === 'recomecar' || msgLimpa === 'restart' || msgLimpa === 'voltar ao inicio';

        if (isRestartFinal) {
            conversations.delete(canonicalJid);
            if (conversation?.leadId) chatService.resetSession(conversation.leadId);
            conversation = undefined;
        }

        // ── 6. LÓGICA DE GATILHOS E NOVO LEAD ──────────────────────────────────
        if (!conversation) {
            const ehGatilhoFinal = gatilhos.some(g => msgLimpa.includes(g));

            if (msgLimpa.includes('não quero continuar') || msgLimpa.includes('cancelar') || msgLimpa.includes('parar')) {
                await this.enviarMensagem(remoteJid, "Atendimento encerrado. Se precisar, é só chamar! 👋");
                const activeLeadId = await this.findActiveLeadId(remoteJid);
                if (activeLeadId) {
                    await prisma.lead.update({ where: { id: activeLeadId }, data: { status: 'perdido' } });
                }
                return;
            }

            const msgOpcao = "1️⃣ Simular Plano Prevent Senior\n2️⃣ Falar com Especialista\n\n_👆 Responda com o número da opção para começar_";
            const botoesIniciais = ['Simular Plano Prevent Senior', 'Falar com Especialista'];

            if (isAudio) {
                lastButtons.set(canonicalJid, botoesIniciais);
                await this.enviarMensagem(remoteJid, "Olá! 👋 Notei que você enviou um áudio, mas no momento eu ainda não consigo ouvi-los. 😅\n\n" + msgOpcao);
                return;
            }

            if (!ehGatilho) {
                // SÓ envia mensagem de "reconexão" se for um lead CONHECIDO e que NÃO está em silêncio
                // Se for um desconhecido mandando "Oi", simplesmente ignoramos para manter silêncio total.
                if (activeLeadId) {
                    const isFinishedOrManualRel = lead && (lead.status !== 'novo' || lead.percentualConclusao >= 100);
                    if (!isFinishedOrManualRel) {
                        lastButtons.set(canonicalJid, botoesIniciais);
                        await this.enviarMensagem(remoteJid, "Olá! 👋 Como passou um tempo, perdi nossa conexão.\n\n" + msgOpcao);
                    } else {
                        console.log(`   🔕 Lead conhecido mas silenciado. Ignorando "reconexão".`);
                    }
                }
                return;
            }

            const leadId = await this.getOrCreateLead(realJid, userId);
            if (!leadId) return;

            conversation = { userId, leadId, lastInteraction: Date.now(), reminded: false };
            conversations.set(canonicalJid, conversation);
            await this.processarResposta(remoteJid, realJid, "", conversation);
            return;
        }

        // ── 4. CONTINUAR CONVERSA ATIVA ────────────────────────────────────────
        conversation.lastInteraction = Date.now();
        conversation.reminded = false;
        await this.processarResposta(remoteJid, realJid, textoFinal, conversation);

        // ── 5. AUTO-SILÊNCIO: Se após processar, o lead atingiu 100%, verificamos se deve fechar a sessão ──
        if (conversation.leadId) {
            const finalLead = await prisma.lead.findUnique({ where: { id: conversation.leadId } });
            const finalSession = await chatService.getOrCreateSession(conversation.leadId);
            const isOutboundInteractFinal = finalSession?.step === ChatStep.OUTBOUND_OPCOES;

            if (finalLead && !isOutboundInteractFinal && (finalLead.percentualConclusao >= 100 || ['negociacao', 'fechado', 'perdido'].includes(finalLead.status))) {
                console.log(`   🔕 Lead ${finalLead.nome} finalizado/em modo manual. Removendo sessão: ${canonicalJid}`);
                conversations.delete(canonicalJid);
            }
        }
    }

    private async findActiveLeadId(remoteJid: string): Promise<string | null> {
        const raw = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '');

        // Normalização para busca flexível (com e sem nono dígito)
        const getVariations = (num: string) => {
            const digits = num.startsWith('55') ? num.slice(2) : num;
            const variations = new Set<string>([num, digits]);

            const format = (d: string) => {
                if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
                if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
                return d;
            };

            variations.add(format(digits));

            if (digits.length === 11 && digits[2] === '9') {
                const without9 = digits.slice(0, 2) + digits.slice(3);
                variations.add(without9);
                variations.add('55' + without9);
                variations.add(format(without9));
            } else if (digits.length === 10) {
                const with9 = digits.slice(0, 2) + '9' + digits.slice(2);
                variations.add(with9);
                variations.add('55' + with9);
                variations.add(format(with9));
            }
            return Array.from(variations);
        };

        const searchNumbers = getVariations(raw);
        console.log(`🔍 [findActiveLeadId] Buscando variações: ${searchNumbers.join(', ')}`);

        try {
            const lead = await prisma.lead.findFirst({
                where: {
                    OR: [
                        { telefone: { in: searchNumbers } },
                        // Fallback para conter os últimos dígitos caso haja formatação bizarra
                        ...searchNumbers.filter(n => n.length >= 8 && !n.includes('(')).map(n => ({
                            telefone: { contains: n.slice(-8) }
                        }))
                    ],
                    status: { notIn: ['fechado', 'perdido'] }
                },
                orderBy: { criadoEm: 'desc' }
            });
            return lead ? lead.id : null;
        } catch (error) {
            console.error('Erro ao buscar lead ativo:', error);
            return null;
        }
    }

    private async processarResposta(remoteJid: string, realJid: string, textoUsuario: string, conversation: ConversationState) {
        if (!conversation.leadId) return;

        try {
            await this.sock.sendPresenceUpdate('composing', remoteJid);
            const chatResponse = await chatService.processUserMessage(conversation.leadId, textoUsuario);

            // Persistência de botões para próxima interação
            const labels = chatResponse.buttons?.map(b => b.label) ?? [];
            const canonicalJidLocal = this.getCanonicalJid(realJid);
            if (labels.length > 0) {
                lastButtons.set(canonicalJidLocal, labels);
                await prisma.lead.update({
                    where: { id: conversation.leadId },
                    data: { lastButtons: labels }
                }).catch(() => { });
            } else {
                lastButtons.delete(canonicalJidLocal);
                await prisma.lead.update({
                    where: { id: conversation.leadId },
                    data: { lastButtons: [] }
                }).catch(() => { });
            }

            // Formatação visual da mensagem
            let mensagemFinal = chatResponse.text;
            if (chatResponse.buttons && chatResponse.buttons.length > 0) {
                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
                mensagemFinal += '\n\n';
                chatResponse.buttons.forEach((btn, i) => {
                    mensagemFinal += `${emojis[i] ?? `${i + 1}.`} ${btn.label}\n`;
                });
                mensagemFinal += '\n_👆 Responda com o número da opção_';
            }

            await this.enviarMensagem(remoteJid, mensagemFinal.trimEnd());

            // Sincroniza etiqueta após interação
            this.syncLeadLabel(realJid, conversation.leadId).catch(() => { });
        } catch (error) {
            console.error('❌ Erro processarResposta:', error);
            await this.enviarMensagem(remoteJid, "Ops, tive um problema técnico. Pode repetir?");
        }
    }

    private async getOrCreateLead(realJid: string, userId?: string): Promise<string | undefined> {
        const telefoneRaw = realJid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '');

        // Se temos um realJid passado, ele tem prioridade
        const formatarTelefone = (raw: string): string => {
            const digits = raw.startsWith('55') ? raw.slice(2) : raw;
            if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
            if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
            return raw;
        };
        const telefone = formatarTelefone(telefoneRaw);

        try {
            const leadExistente = await prisma.lead.findFirst({
                where: { OR: [{ telefone }, { telefone: telefoneRaw }], status: { not: 'finalizado' } },
                orderBy: { criadoEm: 'desc' }
            });

            if (leadExistente) {
                if (leadExistente.telefone === telefoneRaw) {
                    await prisma.lead.update({ where: { id: leadExistente.id }, data: { telefone } });
                }
                return leadExistente.id;
            }

            let corretor = await prisma.user.findFirst({ where: { email: 'lcriva@gmail.com' } });
            if (!corretor) corretor = await prisma.user.findFirst();
            if (!corretor) return undefined;

            const novoLead = await prisma.lead.create({
                data: {
                    telefone,
                    nome: `WhatsApp ${telefone}`,
                    userId: corretor.id,
                    status: 'novo',
                    origem: 'whatsapp',
                    percentualConclusao: 10
                }
            });

            await prisma.interacao.create({
                data: { tipo: 'whatsapp', descricao: 'Início de conversa pelo bot (IA)', leadId: novoLead.id }
            });

            // Etiqueta inicial como Frio
            this.syncLeadLabel(realJid, novoLead.id).catch(() => { });

            return novoLead.id;
        } catch (error) {
            console.error('❌ Erro getOrCreateLead:', error);
            return undefined;
        }
    }

    async enviarMensagem(numero: string, mensagem: string) {
        try {
            if (!this.sock) throw new Error('WhatsApp não conectado');
            const sent = await this.sock.sendMessage(numero, { text: mensagem });

            // Registra o ID da mensagem para não ser interpretado como intervenção manual depois
            if (sent?.key?.id) {
                botSentMessageIds.add(sent.key.id);
                // Limpeza automática para evitar vazamento de memória (mantém apenas os últimos 1000 IDs)
                if (botSentMessageIds.size > 1000) {
                    const firstId = botSentMessageIds.values().next().value;
                    if (firstId) botSentMessageIds.delete(firstId);
                }
            }
            return sent;
        } catch (error) {
            console.error('❌ Erro enviarMensagem:', error);
            throw error;
        }
    }

    /**
     * Registra uma sessão como ativa manualmente (usado para mensagens Outbound)
     * Isso evita que o bot ignore a próxima resposta do cliente por causa das regras de silêncio.
     */
    registrarSessaoAtiva(jid: string, leadId: string, buttons?: string[]) {
        const canonicalJid = this.getCanonicalJid(jid);
        console.log(`📡 [Outbound] Registrando sessão ativa para ${canonicalJid} (Original: ${jid})`);
        conversations.set(canonicalJid, {
            leadId,
            lastInteraction: Date.now(),
            reminded: false
        });
        if (buttons) {
            console.log(`   🔘 Botões registrados em memória: ${buttons.join(', ')}`);
            lastButtons.set(canonicalJid, buttons);
        }
    }

    getQRCode() { return this.qrCodeData; }
    isConnected() { return this.sock?.user !== undefined; }

    desconectar() {
        if (this.sock) { this.sock.end(); this.sock = null; }
        if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
    }

    private startMonitoring() {
        if (this.monitorInterval) return;
        this.monitorInterval = setInterval(() => this.checkInactivity(), 30 * 1000);
    }

    private async checkInactivity() {
        const LIMITE_2_DIAS = 2 * 24 * 60 * 60 * 1000;
        const agora = Date.now();

        for (const [remoteJid, state] of conversations.entries()) {
            if (!this.sock || !state.leadId) continue;
            const tempoInativo = agora - state.lastInteraction;

            try {
                const lead = await prisma.lead.findUnique({ where: { id: state.leadId } });
                if (!lead || lead.status !== 'novo' || lead.percentualConclusao >= 100) {
                    if (tempoInativo >= 15 * 60 * 1000) conversations.delete(remoteJid);
                    continue;
                }

                if ((agora - new Date(lead.criadoEm).getTime()) >= LIMITE_2_DIAS) {
                    await this.enviarMensagem(remoteJid, "Atendimento expirado por inatividade. Se precisar, chame novamente! 👋");
                    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'perdido' } });

                    // Sincroniza etiqueta como Frio (Perdido ainda é frio se < 100)
                    this.syncLeadLabel(remoteJid, lead.id).catch(() => { });

                    conversations.delete(remoteJid);
                    continue;
                }

                // Follow-ups (Simplificados para manter o arquivo limpo)
                const followUpCount = lead.followUpCount || 0;
                const lastFollowUp = lead.lastFollowUpAt ? new Date(lead.lastFollowUpAt).getTime() : 0;

                if (followUpCount === 0 && tempoInativo >= 15 * 60 * 1000) {
                    await this.dispararFollowUp(remoteJid, lead.id, 1);
                } else if (followUpCount > 0 && followUpCount < 20 && (agora - lastFollowUp) >= 2 * 60 * 60 * 1000) {
                    await this.dispararFollowUp(remoteJid, lead.id, followUpCount + 1);
                }
            } catch (err) { console.error("Erro inatividade:", err); }
        }
    }

    private async dispararFollowUp(remoteJid: string, leadId: string, count: number) {
        const msg = count === 1 ? "Olá! 👋 Ainda está por aí? Falta pouco para sua cotação!" : "Quer continuar a cotação? É só responder com o número da opção! 😉";
        try {
            await this.enviarMensagem(remoteJid, msg);
            await prisma.lead.update({ where: { id: leadId }, data: { lastFollowUpAt: new Date(), followUpCount: { increment: 1 } } });

            // Sincroniza etiqueta no follow-up
            this.syncLeadLabel(remoteJid, leadId).catch(() => { });
        } catch (e) { }
    }

    private async fetchLabels() {
        if (!this.sock) return;
        try {
            const result = await this.sock.query({
                tag: 'iq',
                attrs: {
                    display_name: 'WhatsApp business labels',
                    type: 'get',
                    xmlns: 'w:biz:label',
                    to: '@s.whatsapp.net',
                },
                content: [{ tag: 'labels', attrs: {} }]
            });

            if (result && result.content && result.content[0]?.content) {
                const labels = result.content[0].content;
                whatsappLabels.clear();
                labels.forEach((l: any) => {
                    if (l.attrs && l.attrs.name && l.attrs.id) {
                        whatsappLabels.set(l.attrs.name.toLowerCase(), l.attrs.id);
                    }
                });
                console.log(`🏷️ ${whatsappLabels.size} Etiquetas do WhatsApp Business carregadas.`);
            }
        } catch (error) {
            console.error('⚠️ Não foi possível carregar etiquetas (certeza que é conta Business?):', error);
        }
    }

    private async syncLeadLabel(remoteJid: string, leadId: string) {
        if (!this.sock || whatsappLabels.size === 0) return;

        try {
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (!lead) return;

            // Regras do Dashboard:
            // Frio: percentual < 100
            // Quente: percentual === 100 E idade != null E planoDesejado != null
            const isQuente = lead.percentualConclusao === 100 && lead.idade !== null && lead.planoDesejado !== null;
            const isFrio = !isQuente;

            const labelName = isQuente ? 'lead quente' : 'lead frio';
            const labelId = whatsappLabels.get(labelName);

            if (labelId) {
                // Remove a outra etiqueta caso exista (para não ficar com as duas)
                const otherLabelName = isQuente ? 'lead frio' : 'lead quente';
                const otherLabelId = whatsappLabels.get(otherLabelName);

                if (otherLabelId) {
                    await this.sock.chatModify({
                        addChatLabel: { labelId: labelId },
                        removeChatLabel: { labelId: otherLabelId }
                    }, remoteJid);
                } else {
                    await this.sock.chatModify({ addChatLabel: { labelId: labelId } }, remoteJid);
                }

                console.log(`🏷️ Etiqueta "${labelName}" aplicada ao lead ${lead.nome}`);
            } else {
                console.log(`⚠️ Etiqueta "${labelName}" não encontrada no WhatsApp. Crie-a no App Business para funcionar.`);
            }
        } catch (error) {
            console.error('❌ Erro ao sincronizar etiqueta:', error);
        }
    }
}

let whatsappService: WhatsAppService | null = null;
export const getWhatsAppService = () => {
    if (!whatsappService) whatsappService = new WhatsAppService();
    return whatsappService;
};
export default WhatsAppService;