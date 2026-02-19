import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason
} from '@whiskeysockets/baileys';

import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { PrismaClient } from '@prisma/client';
import { processarMensagemIA } from '../lib/openai';
import OpenAI from 'openai';

const prisma = new PrismaClient();

interface ConversationState {
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
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
                    history: [
                        { role: 'system', content: `Sistema: O usuário está retomando uma conversa anterior. Lead ID: ${leadAtivoId}. Dados atuais: ${JSON.stringify(leadDados)}` }
                    ],
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

                conversation = {
                    history: [],
                    userId,
                    leadId,
                    lastInteraction: Date.now(),
                    reminded: false
                };
                conversations.set(remoteJid, conversation);

                // Iniciar com mensagem introdutória da IA
                await this.processarResposta(remoteJid, messageText, conversation);
                return;
            }
        }

        // Atualizar timestamp da última interação
        conversation.lastInteraction = Date.now();
        conversation.reminded = false; // Resetar flag se usuário respondeu

        // Processar resposta
        await this.processarResposta(remoteJid, messageText, conversation);
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
        // 1. Adicionar mensagem do usuário ao histórico (se não for null/vazia)
        if (textoUsuario) {
            conversation.history.push({ role: 'user', content: textoUsuario });
        }

        let loopCount = 0;
        const MAX_LOOPS = 5;
        let respondeu = false;

        try {
            while (loopCount < MAX_LOOPS) {
                loopCount++;
                console.log(`🔄 Loop IA ${loopCount}/${MAX_LOOPS}`);

                // 2. Chamar a IA com Timeout
                console.log('⏳ Chamando OpenAI...');

                // UX: Mostrar "digitando..."
                await this.sock.sendPresenceUpdate('composing', remoteJid);

                // Timeout de 15 segundos para a OpenAI
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('TIMEOUT_OPENAI')), 15000)
                );

                let respostaIA;
                try {
                    respostaIA = await Promise.race([
                        processarMensagemIA(conversation.history),
                        timeoutPromise
                    ]) as any;
                } catch (timeoutErr: any) {
                    if (timeoutErr.message === 'TIMEOUT_OPENAI') {
                        console.error('⏱️ OpenAI demorou demais e deu timeout.');
                        await this.enviarMensagem(remoteJid, "Estou demorando um pouco para pensar... Tente mandar a mensagem novamente?");
                        return;
                    }
                    throw timeoutErr;
                }

                console.log('🔙 Retorno OpenAI:', respostaIA.tipo);

                // Adicionar a resposta da IA ao histórico
                if (respostaIA.msg) {
                    conversation.history.push(respostaIA.msg);
                }

                if (respostaIA.tipo === 'RESPOSTA' && respostaIA.texto) {
                    // IA respondeu com texto FINAL
                    console.log('📤 Enviando resposta texto:', respostaIA.texto);
                    await this.enviarMensagem(remoteJid, respostaIA.texto);
                    conversations.set(remoteJid, conversation);
                    respondeu = true;
                    return; // Sai do loop e da função

                } else if (respostaIA.tipo === 'ATUALIZAR' && respostaIA.dados) {
                    // IA solicitou tool call (atualizar dados)
                    console.log('🤖 IA atualizando dados do lead:', respostaIA.dados);

                    // Atualizar lead no banco
                    if (conversation.leadId) {
                        try {
                            await this.atualizarLead(conversation.leadId, respostaIA.dados);
                        } catch (err) {
                            console.error('❌ Erro ao atualizar lead:', err);
                            // Não para o fluxo, tenta continuar
                        }
                    }

                    if (respostaIA.dados.finalizado) {
                        // Se finalizou, manda mensagem final e encerra
                        console.log('🏁 Finalizando conversa...');
                        if (conversation.leadId) {
                            await this.enviarPropostaFinal(remoteJid, conversation.leadId, respostaIA.dados);
                        }
                        conversations.delete(remoteJid);
                        respondeu = true;
                        return; // Sai do loop
                    }

                    // IA chamou ferramentas (pode ser mais de uma), precisamos devolver o output para TODAS
                    if (respostaIA.msg && respostaIA.msg.tool_calls) {
                        for (const toolCall of respostaIA.msg.tool_calls) {
                            console.log(`🔧 Devolvendo output da tool ${toolCall.id} para IA...`);
                            conversation.history.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ success: true, message: "Dados processados com sucesso." })
                            });
                        }
                        // Loop continua para a próxima iteração
                        continue;
                    } else {
                        console.log('⚠️ Alerta: Tool call sem IDs na mensagem original!');
                    }
                } else if (respostaIA.tipo === 'ERRO') {
                    console.log('❌ Erro retornado pela IA');
                    await this.enviarMensagem(remoteJid, respostaIA.texto || "Erro na IA, tente novamente.");
                    respondeu = true;
                    return;
                }

                // Se chegou aqui e não retornou nem continue, algo estranho
                console.log('⚠️ Loop caiu sem ação definida.');
                break;
            }

            if (!respondeu) {
                console.log('⚠️ Loop terminou sem resposta ao usuário via texto.');
                await this.enviarMensagem(remoteJid, "Desculpe, me confundi um pouco. Pode repetir o que disse?");
            }

        } catch (error) {
            console.error('❌ Erro na conversa com IA:', error);
            await this.enviarMensagem(remoteJid, "Tive um problema técnico. Vamos tentar de novo?");
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

    private async atualizarLead(leadId: string, dados: any) {
        try {
            // Buscar dados atuais para mesclar
            const leadAtual = await prisma.lead.findUnique({ where: { id: leadId } });

            // Dados mesclados (Atuais + Novos)
            const dadosFinais = { ...leadAtual, ...dados };

            // Calcular percentual baseado no acumulado
            let preenchidos = 0;
            const totais = 4; // Nome, Idade, Cidade, Email

            if (dadosFinais.nome) preenchidos++;
            if (dadosFinais.idade) preenchidos++;
            if (dadosFinais.cidade) preenchidos++;
            if (dadosFinais.email) preenchidos++;

            const percentual = Math.round((preenchidos / totais) * 100);

            // Parser de valor mais robusto (Remove tudo que não é número, exceto vírgula e ponto)
            // Ex: "R$ 1.200,50" -> "1200.50"
            let valorPlanoParsed = dados.valorPlano;
            if (typeof dados.valorPlano === 'string') {
                // Remove R$, espaços e caracteres estranhos, mantém números, ponto e vírgula
                let limpo = dados.valorPlano.replace(/[^0-9.,]/g, '');
                // Se tiver vírgula, assume formato BR (remove pontos de milhar primeiro)
                if (limpo.includes(',')) {
                    limpo = limpo.replace(/\./g, '').replace(',', '.');
                }
                valorPlanoParsed = parseFloat(limpo);
            }

            // Atualizar
            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    nome: dados.nome,
                    idade: dados.idade,
                    cidade: dados.cidade,
                    estado: dados.estado,
                    dependentes: dados.dependentes,

                    valorPlano: valorPlanoParsed,
                    planoDesejado: dados.planoDesejado,

                    email: dados.email,
                    percentualConclusao: Math.max(10, percentual),
                    idadesDependentes: dados.idadesDependentes || undefined, // Salvar array de idades
                    scoreIA: this.calcularScoreSimples(dados.idade || 0, dados.dependentes || 0),
                    jaPossuiPlano: dados.jaPossuiPlano
                } as any
            });
            console.log(`💾 Lead ${leadId} atualizado! (${percentual}% concluído)`);

        } catch (error) {
            console.error('❌ Erro ao atualizar lead:', error);
        }
    }

    private async enviarPropostaFinal(remoteJid: string, leadId: string, dados: any) {
        // Se demonstrou interesse em fechar, vira Lead Quente (negociacao)
        // Se não, fica como Lead Morno (novo + 100%)
        const novoStatus = dados.interesseEmFechar ? 'negociacao' : 'novo';

        // Atualizar status para finalizado
        await prisma.lead.update({
            where: { id: leadId },
            data: {
                status: novoStatus,
                percentualConclusao: 100,
                jaPossuiPlano: dados.jaPossuiPlano // Persistir a informação se já possui plano
            }
        });

        // A IA já deve ter apresentado os valores e solicitado os docs.
        // Apenas reforçamos o contato do especialista e encerramos tecnicamente.

        let mensagemFinal = `✅ *Tudo certo!* Já registrei seu interesse.\n\n`;
        mensagemFinal += `Como solicitado, por favor *envie aqui no WhatsApp foto dos seguintes documentos* para adiantarmos:\n`;
        mensagemFinal += `- RG ou CNH\n`;
        mensagemFinal += `- Comprovante de Residência\n`;
        mensagemFinal += `- Cartão do SUS\n\n`;
        mensagemFinal += `👨‍💼 *Nosso especialista vai te chamar em breve* para confirmar os dados e finalizar a proposta.\n`;
        mensagemFinal += `Obrigado pela preferência!`;

        await this.enviarMensagem(remoteJid, mensagemFinal);
        console.log(`✅ Conversa finalizada e lead salvo!`);
    }

    private gerarPropostas(idade: number, dependentes: number, faixaPreco: number) {
        const totalVidas = 1 + dependentes;
        const basePreco = faixaPreco / totalVidas;

        return [
            {
                operadora: 'Bradesco Saúde',
                plano: 'TOP Nacional',
                valor: basePreco * totalVidas * 1.2,
                destaque: 'Cobertura nacional completa'
            },
            {
                operadora: 'Amil',
                plano: 'One S750',
                valor: basePreco * totalVidas * 1.1,
                destaque: 'Melhor custo-benefício'
            },
            {
                operadora: 'SulAmérica',
                plano: 'Clássico',
                valor: basePreco * totalVidas * 1.15,
                destaque: 'Reembolso até 90%'
            }
        ];
    }

    private calcularScoreSimples(idade: number, dependentes: number): number {
        let score = 50;

        if (idade >= 30 && idade <= 50) score += 20;
        else if (idade < 30) score += 10;

        if (dependentes > 0) score += 15;
        if (dependentes >= 2) score += 10;

        return Math.min(score, 100);
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