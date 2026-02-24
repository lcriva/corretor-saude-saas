import { prisma } from '../lib/prisma';
import { pricingService } from './pricingService';

// ===== TIPOS DE RESPOSTA =====
export interface ChatResponse {
    text: string;
    buttons?: string[];
}

// ===== STEPS DA MÁQUINA DE ESTADOS =====
export enum ChatStep {
    // Boas-vindas e menu inicial
    BOAS_VINDAS = 'BOAS_VINDAS',
    CONHECER_PLANO = 'CONHECER_PLANO',

    // Coleta de dados para simulação
    SIMULACAO = 'SIMULACAO',
    DADOS_TITULAR = 'DADOS_TITULAR',
    DEPENDENTES = 'DEPENDENTES',
    QUANTIDADE_DEPENDENTES = 'QUANTIDADE_DEPENDENTES',
    IDADE_DEPENDENTES = 'IDADE_DEPENDENTES',
    CIDADE = 'CIDADE',
    PLANO_ATUAL = 'PLANO_ATUAL',
    PLANO_ATUAL_OPERADORA = 'PLANO_ATUAL_OPERADORA',

    // Cotação e captura
    MOSTRAR_PRECO = 'MOSTRAR_PRECO',
    CAPTURA_NOME = 'CAPTURA_NOME',
    CAPTURA_TELEFONE = 'CAPTURA_TELEFONE',

    // Encerramento
    CONFIRMACAO = 'CONFIRMACAO',
    ESPECIALISTA = 'ESPECIALISTA',
    FINISHED = 'FINISHED',
}

export interface ChatSession {
    leadId: string;
    step: ChatStep;
    lastInteraction: number;
    collectedData: {
        nome?: string;
        jaPossuiPlano?: boolean;
        operadoraAtual?: string;
        isIndividual?: boolean;
        dependentCount?: number;
        titularAge?: number;
        dependentAges: number[];
        currentDependentIndex: number;
        cidade?: string;
        planoDesejado?: string;
        valorPlano?: number;
    };
}

const sessions = new Map<string, ChatSession>();

export class ChatService {

    async getOrCreateSession(leadId: string): Promise<ChatSession> {
        let session = sessions.get(leadId);
        if (!session) {
            session = {
                leadId,
                step: ChatStep.BOAS_VINDAS,
                lastInteraction: Date.now(),
                collectedData: {
                    dependentAges: [],
                    currentDependentIndex: 0,
                },
            };
            sessions.set(leadId, session);
            console.log(`[ChatService v4.0] 🚀 Nova sessão para lead ${leadId}`);
        }
        return session;
    }

    // ===== PONTO DE ENTRADA PRINCIPAL =====
    async processUserMessage(leadId: string, messageText: string): Promise<ChatResponse> {
        const session = await this.getOrCreateSession(leadId);
        session.lastInteraction = Date.now();

        if (messageText) {
            await this.saveInteraction(leadId, 'user', messageText);
        }

        try {
            const response = await this.handleStep(session, messageText);
            await this.saveInteraction(leadId, 'assistant', response.text);
            return response;
        } catch (error) {
            console.error('❌ Erro no ChatService:', error);
            return { text: 'Erro interno ao processar mensagem.' };
        }
    }

    private async handleStep(session: ChatSession, messageText: string): Promise<ChatResponse> {
        const text = messageText.trim().toLowerCase();

        switch (session.step) {

            // ─── BOAS-VINDAS ─────────────────────────────────────────────────
            case ChatStep.BOAS_VINDAS: {
                session.step = ChatStep.SIMULACAO;
                return {
                    text:
                        'Olá! 👋\n\n' +
                        'Sou a *MarIA*, especialista digital da Prevent Senior.\n\n' +
                        '🏥 Mais de 3.000 pessoas já fizeram a simulação aqui!\n\n' +
                        'Posso calcular o valor do seu plano de saúde em menos de 30 segundos.\n\n' +
                        'O que deseja fazer?',
                    buttons: ['Simular plano', 'Falar com especialista', 'Conhecer o plano'],
                };
            }

            // ─── CONHECER O PLANO ─────────────────────────────────────────────
            case ChatStep.CONHECER_PLANO: {
                session.step = ChatStep.SIMULACAO;
                return {
                    text:
                        'A Prevent Senior é referência em saúde há mais de *28 anos*. 💙\n\n' +
                        'Alguns diferenciais do plano:\n\n' +
                        '✔ Sem coparticipação\n' +
                        '✔ Rede com Hospitais Sancta Maggiore\n' +
                        '✔ Telemedicina e atendimento domiciliar\n' +
                        '✔ Sem reajuste por idade após 50 anos\n\n' +
                        'Agora posso calcular o valor do plano ideal para você.',
                    buttons: ['Simular plano'],
                };
            }

            // ─── SIMULACAO (intro) ─────────────────────────────────────────────
            case ChatStep.SIMULACAO: {
                // Redirecionar botões da tela de boas-vindas
                if (text.includes('especialista') || text === 'falar com especialista') {
                    return this.encaminharEspecialista(session);
                }
                if (text.includes('conhecer') || text === 'conhecer o plano') {
                    session.step = ChatStep.CONHECER_PLANO;
                    return this.handleStep(session, '');
                }

                // Qualquer outra coisa (incluindo "Simular plano"): ir para coleta de dados
                session.step = ChatStep.DADOS_TITULAR;
                return {
                    text:
                        'Perfeito! ✅\n\n' +
                        'Para calcular o valor do plano, preciso de algumas informações rápidas.\n\n' +
                        'Qual a *idade do titular* do plano?',
                };
            }

            // ─── DADOS DO TITULAR ─────────────────────────────────────────────
            case ChatStep.DADOS_TITULAR: {
                const age = parseInt(messageText.replace(/\D/g, ''));
                if (isNaN(age) || age < 0 || age > 120) {
                    return { text: 'Por favor, informe uma idade válida (ex: 45).' };
                }
                session.collectedData.titularAge = age;
                await this.updateLead(session.leadId, { idade: age });

                session.step = ChatStep.DEPENDENTES;
                return {
                    text: 'Deseja incluir dependentes no plano?',
                    buttons: ['Não', 'Sim'],
                };
            }

            // ─── DEPENDENTES ──────────────────────────────────────────────────
            case ChatStep.DEPENDENTES: {
                const temDependentes =
                    text === 'sim' || text.includes('sim') || text.includes('s');
                const naoDependentes =
                    text === 'não' || text === 'nao' || text.includes('não') ||
                    text.includes('nao') || text === 'n';

                if (naoDependentes) {
                    session.collectedData.isIndividual = true;
                    session.collectedData.dependentCount = 0;
                    session.step = ChatStep.CIDADE;
                    return { text: 'Em qual *cidade* você mora?' };
                }

                if (temDependentes) {
                    session.collectedData.isIndividual = false;
                    session.step = ChatStep.QUANTIDADE_DEPENDENTES;
                    return { text: 'Quantos dependentes deseja incluir?' };
                }

                return {
                    text: 'Por favor, responda *Sim* ou *Não*.',
                    buttons: ['Não', 'Sim'],
                };
            }

            // ─── QUANTIDADE DE DEPENDENTES ────────────────────────────────────
            case ChatStep.QUANTIDADE_DEPENDENTES: {
                const count = parseInt(messageText.replace(/\D/g, ''));
                if (isNaN(count) || count < 1) {
                    return { text: 'Por favor, informe o número de dependentes (ex: 1, 2...).' };
                }
                session.collectedData.dependentCount = count;
                session.collectedData.dependentAges = [];
                session.collectedData.currentDependentIndex = 1;
                await this.updateLead(session.leadId, { dependentes: count });

                session.step = ChatStep.IDADE_DEPENDENTES;
                return { text: `Informe a idade do *1º dependente*.\nExemplo: 62` };
            }

            // ─── IDADES DOS DEPENDENTES ───────────────────────────────────────
            case ChatStep.IDADE_DEPENDENTES: {
                const age = parseInt(messageText.replace(/\D/g, ''));
                if (isNaN(age) || age < 0 || age > 120) {
                    return { text: 'Por favor, informe uma idade válida (ex: 62).' };
                }

                session.collectedData.dependentAges.push(age);
                const idx = session.collectedData.currentDependentIndex;
                const total = session.collectedData.dependentCount || 0;

                if (idx < total) {
                    session.collectedData.currentDependentIndex++;
                    return { text: `Informe a idade do *${idx + 1}º dependente*.` };
                }

                // Coletou todas as idades
                await this.updateLead(session.leadId, {
                    idadesDependentes: session.collectedData.dependentAges,
                });

                session.step = ChatStep.CIDADE;
                return { text: 'Em qual *cidade* você mora?' };
            }

            // ─── CIDADE ───────────────────────────────────────────────────────
            case ChatStep.CIDADE: {
                session.collectedData.cidade = messageText.trim();
                await this.updateLead(session.leadId, { cidade: messageText.trim() });

                session.step = ChatStep.PLANO_ATUAL;
                return {
                    text: 'Você possui plano de saúde atualmente?',
                    buttons: ['Não', 'Sim'],
                };
            }

            // ─── PLANO ATUAL ──────────────────────────────────────────────────
            case ChatStep.PLANO_ATUAL: {
                const temPlano =
                    text === 'sim' || text.includes('sim');
                const naoPlano =
                    text === 'não' || text === 'nao' || text.includes('não') ||
                    text.includes('nao');

                if (naoPlano) {
                    session.collectedData.jaPossuiPlano = false;
                    await this.updateLead(session.leadId, { jaPossuiPlano: 'Não' });
                    return this.mostrarPreco(session);
                }

                if (temPlano) {
                    session.collectedData.jaPossuiPlano = true;
                    session.step = ChatStep.PLANO_ATUAL_OPERADORA;
                    return { text: 'Qual é a operadora do seu plano atual?' };
                }

                return {
                    text: 'Por favor, responda *Sim* ou *Não*.',
                    buttons: ['Não', 'Sim'],
                };
            }

            // ─── OPERADORA ATUAL ──────────────────────────────────────────────
            case ChatStep.PLANO_ATUAL_OPERADORA: {
                const operadora = messageText.trim();
                session.collectedData.operadoraAtual = operadora;
                await this.updateLead(session.leadId, {
                    jaPossuiPlano: operadora,
                    operadoraAtual: operadora,
                });
                return this.mostrarPreco(session);
            }

            // ─── MOSTRAR PREÇO (escolha do tipo de plano) ────────────────────
            case ChatStep.MOSTRAR_PRECO: {
                const escolha = text;
                const ages = [
                    session.collectedData.titularAge!,
                    ...session.collectedData.dependentAges,
                ];
                const quotes = pricingService.buildQuote(ages);

                if (escolha.includes('enfermaria')) {
                    session.collectedData.planoDesejado = 'Enfermaria';
                    session.collectedData.valorPlano = quotes.enfermaria.total;
                    await this.updateLead(session.leadId, {
                        planoDesejado: 'Enfermaria',
                        valorPlano: quotes.enfermaria.total,
                        valorEstimado: quotes.enfermaria.total,
                        status: 'negociacao',
                        percentualConclusao: 80,
                    });
                } else if (escolha.includes('apartamento')) {
                    session.collectedData.planoDesejado = 'Apartamento';
                    session.collectedData.valorPlano = quotes.apartamento.total;
                    await this.updateLead(session.leadId, {
                        planoDesejado: 'Apartamento',
                        valorPlano: quotes.apartamento.total,
                        valorEstimado: quotes.apartamento.total,
                        status: 'negociacao',
                        percentualConclusao: 80,
                    });
                } else {
                    return {
                        text: 'Por favor, escolha uma das opções abaixo:',
                        buttons: ['Enfermaria', 'Apartamento'],
                    };
                }

                session.step = ChatStep.CAPTURA_NOME;
                return {
                    text:
                        'Perfeito! 🎉\n\n' +
                        'Agora vou preparar sua proposta completa.\n\n' +
                        'Qual o seu *nome completo*?',
                };
            }

            // ─── CAPTURA DO NOME ──────────────────────────────────────────────
            case ChatStep.CAPTURA_NOME: {
                const nome = messageText.trim();
                if (nome.length < 3) {
                    return { text: 'Por favor, informe seu nome completo.' };
                }
                session.collectedData.nome = nome;
                await this.updateLead(session.leadId, { nome });

                // Verificar se é site (precisamos do telefone) ou WhatsApp (já tem telefone)
                const lead = await prisma.lead.findUnique({ where: { id: session.leadId } });
                const needsPhone = lead?.origem !== 'whatsapp' && lead?.telefone.startsWith('web-');

                if (needsPhone) {
                    session.step = ChatStep.CAPTURA_TELEFONE;
                    return { text: 'Qual o seu *WhatsApp com DDD*?\n\nExemplo: 11999999999' };
                } else {
                    return this.gerarConfirmacao(session);
                }
            }

            // ─── CAPTURA DO TELEFONE (site) ───────────────────────────────────
            case ChatStep.CAPTURA_TELEFONE: {
                const phone = messageText.replace(/\D/g, '');
                if (phone.length < 10) {
                    return { text: 'Por favor, informe o WhatsApp com DDD (ex: 11999999999).' };
                }
                await this.updateLead(session.leadId, { telefone: phone });
                return this.gerarConfirmacao(session);
            }

            // ─── CONFIRMAÇÃO ──────────────────────────────────────────────────
            case ChatStep.CONFIRMACAO: {
                if (text.includes('especialista') || text.includes('falar')) {
                    return this.encaminharEspecialista(session);
                }
                if (text.includes('rede') || text.includes('credenciada')) {
                    return {
                        text:
                            '🏥 *Rede Credenciada Prevent Senior*\n\n' +
                            'Acesse a rede completa em:\n' +
                            'https://www.preventsenior.com.br/rede-credenciada\n\n' +
                            'Nossal rede inclui Hospitais Sancta Maggiore, ' +
                            'clínicas especializadas, laboratórios e muito mais.\n\n' +
                            '👨‍⚕️ Quer falar com um especialista para finalizar a contratação?',
                        buttons: ['Falar com especialista'],
                    };
                }
                return {
                    text: 'Como posso te ajudar? 😊',
                    buttons: ['Ver rede credenciada', 'Falar com especialista'],
                };
            }

            // ─── ESPECIALISTA ─────────────────────────────────────────────────
            case ChatStep.ESPECIALISTA: {
                return {
                    text: 'Seu atendimento já foi encaminhado! Um especialista entrará em contato em breve. 💙',
                };
            }

            // ─── FINISHED ─────────────────────────────────────────────────────
            case ChatStep.FINISHED: {
                return {
                    text: 'Seu atendimento já foi encaminhado. Se precisar de mais alguma coisa, é só chamar! 😊',
                };
            }

            default:
                return { text: 'Desculpe, me perdi. Pode repetir?' };
        }
    }

    // ===== HELPERS =====

    private async mostrarPreco(session: ChatSession): Promise<ChatResponse> {
        const ages = [
            session.collectedData.titularAge!,
            ...session.collectedData.dependentAges,
        ];
        const quotes = pricingService.buildQuote(ages);

        let msg =
            'Com base nas informações que você informou, temos duas opções:\n\n' +
            '*Plano Prevent Ma+s*\n\n' +
            '🛏 *Enfermaria*\n' +
            pricingService.formatQuote(quotes.enfermaria) +
            '\n🛏 *Apartamento*\n' +
            pricingService.formatQuote(quotes.apartamento) +
            '\n\nQual tipo de acomodação você prefere?';

        session.step = ChatStep.MOSTRAR_PRECO;
        return {
            text: msg,
            buttons: ['Enfermaria', 'Apartamento'],
        };
    }

    private async gerarConfirmacao(session: ChatSession): Promise<ChatResponse> {
        // Calcular lead score
        const score = this.calcularLeadScore(session);
        await this.updateLead(session.leadId, {
            leadScore: score,
            status: 'negociacao',
            percentualConclusao: 95,
        });

        session.step = ChatStep.CONFIRMACAO;
        return {
            text:
                'Obrigado! 🎉\n\n' +
                'Um especialista da Prevent Senior vai entrar em contato com você para:\n\n' +
                '✔ Confirmar os valores\n' +
                '✔ Apresentar a rede credenciada\n' +
                '✔ Explicar as carências\n' +
                '✔ Finalizar a contratação\n\n' +
                'Se quiser, também posso enviar agora os detalhes da rede hospitalar.',
            buttons: ['Ver rede credenciada', 'Falar com especialista'],
        };
    }

    private async encaminharEspecialista(session: ChatSession): Promise<ChatResponse> {
        await this.updateLead(session.leadId, {
            status: 'negociacao',
            percentualConclusao: 100,
        });
        session.step = ChatStep.ESPECIALISTA;
        return {
            text:
                'Vou encaminhar você agora para um especialista. Aguarde um momento... ✅\n\n' +
                'Em breve nossa equipe entrará em contato! 💙',
        };
    }

    private calcularLeadScore(session: ChatSession): number {
        let score = 0;
        const { titularAge, jaPossuiPlano, dependentCount, planoDesejado } = session.collectedData;

        if (titularAge && titularAge > 55) score += 3;
        if (jaPossuiPlano) score += 3;
        if (dependentCount && dependentCount > 0) score += 2;
        if (planoDesejado === 'Apartamento') score += 2;

        console.log(`[ChatService v4.0] 🏆 Lead score calculado: ${score}`);
        return score;
    }

    // ===== CRUD / PERSISTÊNCIA =====

    async createLead(userId: string, origem: string = 'web'): Promise<string> {
        console.log(`[ChatService v4.0] 🆕 Criando novo lead para userId: ${userId}`);
        const lead = await prisma.lead.create({
            data: {
                userId,
                origem,
                telefone: 'web-' + Date.now(),
                nome: 'Visitante Site',
                status: 'novo',
            },
        });
        console.log(`[ChatService v4.0] ✅ Lead criado: ${lead.id}`);
        return lead.id;
    }

    private async updateLead(leadId: string, dados: any) {
        try {
            await prisma.lead.update({ where: { id: leadId }, data: dados });
        } catch (error) {
            console.error(`[ChatService v4.0] ❌ Erro ao atualizar lead ${leadId}:`, error);
        }
    }

    private async saveInteraction(leadId: string, role: 'user' | 'assistant', content: string) {
        try {
            await prisma.interacao.create({
                data: {
                    leadId,
                    tipo: role === 'user' ? 'mensagem_usuario' : 'mensagem_marIA',
                    descricao: content.substring(0, 500),
                },
            });
        } catch (error) {
            console.error('[ChatService v4.0] Erro ao salvar interação:', error);
        }
    }
}

export const chatService = new ChatService();
