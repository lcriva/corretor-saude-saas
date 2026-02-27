import { prisma } from '../lib/prisma';
import { pricingService } from './pricingService';

// ===== TIPOS DE RESPOSTA =====
export interface ChatButton {
    label: string;
    url?: string; // Se definido, abre link externo no ChatWidget
}

export interface ChatResponse {
    text: string;
    buttons?: ChatButton[];
}

// ===== STEPS DA MÁQUINA DE ESTADOS =====
export enum ChatStep {
    BOAS_VINDAS = 'BOAS_VINDAS',
    CHECKLIST = 'CHECKLIST',
    CONHECER_PLANO = 'CONHECER_PLANO',
    SIMULACAO = 'SIMULACAO',
    DADOS_TITULAR = 'DADOS_TITULAR',
    DEPENDENTES = 'DEPENDENTES',
    QUANTIDADE_DEPENDENTES = 'QUANTIDADE_DEPENDENTES',
    IDADE_DEPENDENTES = 'IDADE_DEPENDENTES',
    CIDADE = 'CIDADE',
    PLANO_ATUAL = 'PLANO_ATUAL',
    PLANO_ATUAL_OPERADORA = 'PLANO_ATUAL_OPERADORA',
    MOSTRAR_PRECO = 'MOSTRAR_PRECO',
    CAPTURA_NOME = 'CAPTURA_NOME',
    CAPTURA_TELEFONE = 'CAPTURA_TELEFONE',
    CONFIRMACAO = 'CONFIRMACAO',
    URGENCIA = 'URGENCIA', // Novo step para capturar urgência
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
        urgencia?: string;
    };
    pendingAction?: 'encaminhar' | 'confirmar';
}

const sessions = new Map<string, ChatSession>();

// Helper para converter label string em ChatButton
const btn = (label: string, url?: string): ChatButton => ({ label, url });

export class ChatService {

    async getOrCreateSession(leadId: string): Promise<ChatSession> {
        let session = sessions.get(leadId);
        if (!session) {
            session = {
                leadId,
                step: ChatStep.BOAS_VINDAS,
                lastInteraction: Date.now(),
                collectedData: { dependentAges: [], currentDependentIndex: 0 },
            };
            sessions.set(leadId, session);
        }
        return session;
    }

    resetSession(leadId: string) {
        sessions.delete(leadId);
    }

    async processUserMessage(leadId: string, messageText: string): Promise<ChatResponse> {
        const session = await this.getOrCreateSession(leadId);
        session.lastInteraction = Date.now();

        if (messageText) await this.saveInteraction(leadId, 'user', messageText);

        try {
            const response = await this.handleStep(session, messageText);
            await this.saveInteraction(leadId, 'assistant', response.text);
            return response;
        } catch (error) {
            console.error('❌ Erro no ChatService:', error);
            return { text: 'Erro interno ao processar mensagem.' };
        }
    }

    private isTelefoneValido(telefone: string): boolean {
        if (!telefone) return false;
        // Se começar com web-, é vindo do site sem cadastro
        if (telefone.startsWith('web-')) return false;

        const apenasNumeros = telefone.replace(/\D/g, '');

        // IDs mascarados de anúncios costumam ter 14 ou 15 dígitos e não seguem padrão de celular
        // Um telefone brasileiro com DDI 55 tem no máximo 13 dígitos (55 + DDD + 9 dígitos)
        if (apenasNumeros.length > 13) return false;

        // Um telefone brasileiro válido tem 10 ou 11 dígitos (fora o 55)
        return apenasNumeros.length >= 10 && apenasNumeros.length <= 13;
    }

    private async handleStep(session: ChatSession, messageText: string): Promise<ChatResponse> {
        const text = messageText.trim().toLowerCase();

        // ─── DESVIO GLOBAL: FALAR COM ESPECIALISTA ──────────────────────────
        // Se o usuário clicar no botão em QUALQUER etapa (exceto capturas), redirecionamos
        const isEspecialistaIntent = text.includes('especialista') || text === 'falar com especialista' || text.includes('falar com um especialista');
        const isCapturaStep = session.step === ChatStep.CAPTURA_NOME || session.step === ChatStep.CAPTURA_TELEFONE;

        if (isEspecialistaIntent && !isCapturaStep) {
            return this.encaminharEspecialista(session);
        }

        // ─── DESVIO GLOBAL: RECOMEÇAR ───────────────────────────────────────
        if (text === 'recomeçar' || text === 'recomecar' || text === 'restart' || text === 'voltar ao início') {
            session.step = ChatStep.BOAS_VINDAS;
            session.collectedData = { dependentAges: [], currentDependentIndex: 0 };
            return this.handleStep(session, '');
        }

        switch (session.step) {

            // ─── BOAS-VINDAS ──────────────────────────────────────────────────
            case ChatStep.BOAS_VINDAS: {
                session.step = ChatStep.CHECKLIST;
                return {
                    text:
                        'Olá! 👋 Seja bem-vindo à nossa simulação inteligente.\n\n' +
                        'Antes de falarmos com nossos especialistas, preparamos um breve *Checklist* para você conhecer os diferenciais da Prevent Senior.\n\n' +
                        'Podemos prosseguir?',
                    buttons: [btn('Ver Checklist')],
                };
            }

            // ─── CHECKLIST INICIAL ────────────────────────────────────────────
            case ChatStep.CHECKLIST: {
                const prosseguir = text.includes('prosseguir') || text.includes('ver') || text.includes('checklist') || text === '1';

                if (prosseguir) {
                    session.step = ChatStep.SIMULACAO;
                    return {
                        text:
                            '📋 *Checklist Prevent Senior — O que você precisa saber*\n\n' +
                            'A *Prevent Senior* é a operadora pioneira e especialista no público *40 anos+*. Nossa estrutura foi projetada para oferecer conforto, modernidade e uma experiência única em saúde.\n\n' +
                            '📍 *Onde estamos:* São Paulo, Baixada Santista e Rio de Janeiro.\n\n' +
                            '🛡 *Cobertura:* Padrão ROL ANS (Internações, cirurgias, consultas, exames laboratoriais, terapias e coleta domiciliar).\n\n' +
                            '⏳ *Carências Padrão:*\n' +
                            '• *24h:* Urgência e Emergência\n' +
                            '• *30 dias:* Consultas e exames simples\n' +
                            '• *180 dias:* Internações e cirurgias\n' +
                            '• *24 meses:* Doenças pré-existentes\n\n' +
                            '🔄 *Portabilidade:* Se você já tem plano, podemos reduzir ou isentar suas carências!\n\n' +
                            'Deseja simular os valores agora ou falar direto com um especialista?',
                        buttons: [btn('Simular plano'), btn('Falar com especialista')],
                    };
                }

                return this.getFallbackResponse('Por favor, informe se podemos prosseguir ou se deseja falar com um especialista.');
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
                    buttons: [btn('Simular plano')],
                };
            }

            // ─── SIMULACAO (distribuidor de intenções) ─────────────────────────
            case ChatStep.SIMULACAO: {
                const isSimular = text.includes('simular') || text.includes('plano') || text.includes('valor') || text === '1';
                const isConhecer = text.includes('conhecer') || text === 'conhecer o plano';
                const isEspecialista = text.includes('especialista') || text === '2';

                if (isConhecer) {
                    session.step = ChatStep.CONHECER_PLANO;
                    return this.handleStep(session, '');
                }

                if (isSimular) {
                    session.step = ChatStep.DADOS_TITULAR;
                    return {
                        text: 'Perfeito! ✅\n\nPara calcular o valor do plano, preciso de algumas informações rápidas.\n\nQual a *idade do titular* do plano?',
                    };
                }

                if (isEspecialista) {
                    return this.encaminharEspecialista(session);
                }

                return this.getFallbackResponse('Para continuarmos, por favor escolha se deseja *Simular o plano* ou *Falar com um especialista*.');
            }

            // ─── DADOS DO TITULAR ─────────────────────────────────────────────
            case ChatStep.DADOS_TITULAR: {
                const age = parseInt(messageText.replace(/\D/g, ''));
                if (isNaN(age) || age < 0 || age > 120) {
                    return this.getFallbackResponse('Por favor, informe uma idade válida (ex: 45).');
                }
                session.collectedData.titularAge = age;
                await this.updateLead(session.leadId, { idade: age });
                session.step = ChatStep.DEPENDENTES;
                return { text: 'Deseja incluir dependentes no plano?', buttons: [btn('Não'), btn('Sim')] };
            }

            // ─── DEPENDENTES ──────────────────────────────────────────────────
            case ChatStep.DEPENDENTES: {
                const naoDep = text === 'não' || text === 'nao' || text.includes('não') || text.includes('nao') || text === 'n';
                const simDep = text === 'sim' || text.includes('sim');

                if (naoDep) {
                    session.collectedData.isIndividual = true;
                    session.collectedData.dependentCount = 0;
                    session.step = ChatStep.CIDADE;
                    return { text: 'Em qual cidade você mora?', buttons: [btn('SP'), btn('RJ')] };
                }
                if (simDep) {
                    session.collectedData.isIndividual = false;
                    session.step = ChatStep.QUANTIDADE_DEPENDENTES;
                    return { text: 'Quantos dependentes deseja incluir?' };
                }
                return this.getFallbackResponse('Por favor, responda *Sim* ou *Não*.');
            }

            // ─── QUANTIDADE DE DEPENDENTES ────────────────────────────────────
            case ChatStep.QUANTIDADE_DEPENDENTES: {
                const count = parseInt(messageText.replace(/\D/g, ''));
                if (isNaN(count) || count < 1) {
                    return this.getFallbackResponse('Por favor, informe o número de dependentes (ex: 1, 2...).');
                }
                session.collectedData.dependentCount = count;
                session.collectedData.dependentAges = [];
                session.collectedData.currentDependentIndex = 1;
                await this.updateLead(session.leadId, { dependentes: count });
                session.step = ChatStep.IDADE_DEPENDENTES;
                return { text: 'Informe a idade do *1º dependente*.\nExemplo: 62' };
            }

            // ─── IDADES DOS DEPENDENTES ───────────────────────────────────────
            case ChatStep.IDADE_DEPENDENTES: {
                const age = parseInt(messageText.replace(/\D/g, ''));
                if (isNaN(age) || age < 0 || age > 120) {
                    return this.getFallbackResponse('Por favor, informe uma idade válida (ex: 62).');
                }
                session.collectedData.dependentAges.push(age);
                const idx = session.collectedData.currentDependentIndex;
                const total = session.collectedData.dependentCount || 0;

                if (idx < total) {
                    session.collectedData.currentDependentIndex++;
                    return { text: `Informe a idade do *${idx + 1}º dependente*.` };
                }
                await this.updateLead(session.leadId, { idadesDependentes: session.collectedData.dependentAges });
                session.step = ChatStep.CIDADE;
                return { text: 'Em qual cidade você mora?', buttons: [btn('SP'), btn('RJ')] };
            }

            // ─── CIDADE ───────────────────────────────────────────────────────
            case ChatStep.CIDADE: {
                const rawCidade = messageText.trim();
                const rawLower = rawCidade.toLowerCase();

                // Nenhuma entrada válida → repetir
                if (!rawCidade || rawCidade.length < 2) {
                    return this.getFallbackResponse('Por favor, selecione ou digite sua cidade.');
                }

                // Normalizar botões SP / RJ
                let cidadeNormal = rawCidade;
                if (rawLower === 'sp' || rawLower.includes('paulo')) cidadeNormal = 'São Paulo';
                else if (rawLower === 'rj' || rawLower.includes('janeiro')) cidadeNormal = 'Rio de Janeiro';

                session.collectedData.cidade = cidadeNormal;
                await this.updateLead(session.leadId, { cidade: cidadeNormal });
                session.step = ChatStep.PLANO_ATUAL;
                return { text: 'Você possui plano de saúde atualmente?', buttons: [btn('Não'), btn('Sim')] };
            }

            // ─── PLANO ATUAL ──────────────────────────────────────────────────
            case ChatStep.PLANO_ATUAL: {
                const temPlano = text === 'sim' || text.includes('sim');
                const naoPlano = text === 'não' || text === 'nao' || text.includes('não') || text.includes('nao');

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
                return this.getFallbackResponse('Por favor, responda *Sim* ou *Não*.');
            }

            // ─── OPERADORA ATUAL ──────────────────────────────────────────────
            case ChatStep.PLANO_ATUAL_OPERADORA: {
                const operadora = messageText.trim();
                session.collectedData.operadoraAtual = operadora;
                await this.updateLead(session.leadId, { jaPossuiPlano: operadora, operadoraAtual: operadora });
                return this.mostrarPreco(session);
            }

            // ─── MOSTRAR PREÇO (escolha do plano) ────────────────────────────
            case ChatStep.MOSTRAR_PRECO: {
                const ages = [session.collectedData.titularAge!, ...session.collectedData.dependentAges];
                const quotes = pricingService.buildQuote(ages);

                if (text.includes('mais enfermaria') || text.includes('mais_enfermaria')) {
                    session.collectedData.planoDesejado = 'Prevent MAIS Enfermaria';
                    session.collectedData.valorPlano = quotes.mais_enfermaria.total;
                    await this.updateLead(session.leadId, { planoDesejado: 'Prevent MAIS Enfermaria', valorPlano: quotes.mais_enfermaria.total, valorEstimado: quotes.mais_enfermaria.total, status: 'novo', percentualConclusao: 80 });
                } else if (text.includes('mais apartamento') || text.includes('mais_apartamento')) {
                    session.collectedData.planoDesejado = 'Prevent MAIS Apartamento';
                    session.collectedData.valorPlano = quotes.mais_apartamento.total;
                    await this.updateLead(session.leadId, { planoDesejado: 'Prevent MAIS Apartamento', valorPlano: quotes.mais_apartamento.total, valorEstimado: quotes.mais_apartamento.total, status: 'novo', percentualConclusao: 80 });
                } else if (text.includes('1025 enfermaria') || text.includes('1025_enfermaria') || text.includes('enfermaria')) {
                    session.collectedData.planoDesejado = 'Prevent Senior 1025 Enfermaria';
                    session.collectedData.valorPlano = quotes.ps1025_enfermaria.total;
                    await this.updateLead(session.leadId, { planoDesejado: 'Prevent Senior 1025 Enfermaria', valorPlano: quotes.ps1025_enfermaria.total, valorEstimado: quotes.ps1025_enfermaria.total, status: 'novo', percentualConclusao: 80 });
                } else if (text.includes('1025 apartamento') || text.includes('1025_apartamento') || text.includes('apartamento')) {
                    session.collectedData.planoDesejado = 'Prevent Senior 1025 Apartamento';
                    session.collectedData.valorPlano = quotes.ps1025_apartamento.total;
                    await this.updateLead(session.leadId, { planoDesejado: 'Prevent Senior 1025 Apartamento', valorPlano: quotes.ps1025_apartamento.total, valorEstimado: quotes.ps1025_apartamento.total, status: 'novo', percentualConclusao: 80 });
                } else {
                    return this.getFallbackResponse('Para não haver erros, escolha uma das opções de planos abaixo ou fale com um especialista:');
                }

                session.step = ChatStep.CAPTURA_NOME;
                return { text: 'Perfeito! 🎉\n\nAgora vou preparar sua proposta completa.\n\nQual o seu *nome completo*?' };
            }

            // ─── CAPTURA DO NOME ──────────────────────────────────────────────
            case ChatStep.CAPTURA_NOME: {
                const nome = messageText.trim();
                if (nome.length < 3) return this.getFallbackResponse('Por favor, informe seu nome completo.');
                session.collectedData.nome = nome;
                await this.updateLead(session.leadId, { nome });

                const lead = await prisma.lead.findUnique({ where: { id: session.leadId } });
                const phoneInvalido = lead ? !this.isTelefoneValido(lead.telefone) : true;

                // Só marcamos como "precisa de telefone" se:
                // 1. O número atual for comprovadamente inválido (web- ou ID mascarado)
                // 2. E a origem NÃO for WhatsApp (pois no WhatsApp tentaremos pegar o realJid automaticamente)
                // Ou se for Web e ainda tiver o prefixo "web-"
                let needsPhone = false;
                if (lead?.origem === 'whatsapp') {
                    // Se o telefone atual for comprovadamente inválido (LID de 14 dígitos), precisamos perguntar.
                    // Caso contrário (número real extraído), pulamos.
                    needsPhone = phoneInvalido;
                } else {
                    needsPhone = phoneInvalido || lead?.telefone.startsWith('web-') || false;
                }

                if (needsPhone) {
                    session.step = ChatStep.CAPTURA_TELEFONE;
                    return { text: 'Qual o seu *WhatsApp com DDD*?\n\nExemplo: 11999999999' };
                }

                if (session.pendingAction === 'encaminhar') {
                    return this.encaminharEspecialista(session);
                }

                return this.gerarConfirmacao(session);
            }

            // ─── CAPTURA DO TELEFONE (site) ───────────────────────────────────
            case ChatStep.CAPTURA_TELEFONE: {
                const phone = messageText.replace(/\D/g, '');
                if (phone.length < 10) return this.getFallbackResponse('Por favor, informe o WhatsApp com DDD (ex: 11999999999).');
                await this.updateLead(session.leadId, { telefone: phone });

                if (session.pendingAction === 'encaminhar') {
                    return this.encaminharEspecialista(session);
                }

                return this.gerarConfirmacao(session);
            }

            // ─── CONFIRMAÇÃO ──────────────────────────────────────────────────
            case ChatStep.CONFIRMACAO: {
                if (text.includes('aguardar') || text.includes('contato') || text.includes('fechar')) {
                    // Se escolher aguardar, ainda perguntamos a urgência para priorizar
                    return this.gerarConfirmacao(session);
                }
                if (text.includes('hoje') || text.includes('semana') || text.includes('urgencia')) {
                    return this.handleUrgency(session, text);
                }
                if (text.includes('rede') || text.includes('credenciada')) {
                    return {
                        text: '🏥 *Rede Credenciada Prevent Senior*\n\nAcesse a rede completa em:\nhttps://preventseniormelhoridade.com.br/#rede\n\n👨‍⚕️ Quer falar com um especialista para finalizar a contratação?',
                        buttons: [btn('Aguardar Contato para Fechar o Plano'), btn('Falar com especialista')],
                    };
                }
                return {
                    text: 'Como posso te ajudar? 😊',
                    buttons: [
                        btn('Aguardar Contato para Fechar o Plano'),
                        btn('Ver rede credenciada', 'https://preventseniormelhoridade.com.br/#rede'),
                        btn('Falar com especialista'),
                    ],
                };
            }

            // ─── URGÊNCIA ─────────────────────────────────────────────────────
            case ChatStep.URGENCIA: {
                return this.handleUrgency(session, text);
            }

            // ─── ESPECIALISTA ─────────────────────────────────────────────────
            case ChatStep.ESPECIALISTA:
            case ChatStep.FINISHED: {
                return { text: 'Seu atendimento já foi encaminhado. Se precisar de mais alguma coisa, é só chamar! 😊' };
            }

            default:
                return { text: 'Desculpe, me perdi. Pode repetir?' };
        }
    }

    // ===== HELPERS =====

    private async mostrarPreco(session: ChatSession): Promise<ChatResponse> {
        const ages = [session.collectedData.titularAge!, ...session.collectedData.dependentAges];
        const quotes = pricingService.buildQuote(ages);

        const msg =
            'Com base nas informações que você informou, veja as opções disponíveis:\n\n' +
            '*Prevent Senior 1025*\n' +
            pricingService.formatQuote(quotes.ps1025_enfermaria) +
            '\n' + pricingService.formatQuote(quotes.ps1025_apartamento) +
            '\n*Prevent MAIS*\n' +
            pricingService.formatQuote(quotes.mais_enfermaria) +
            '\n' + pricingService.formatQuote(quotes.mais_apartamento) +
            '\n\nQual plano e acomodação você prefere?';

        session.step = ChatStep.MOSTRAR_PRECO;
        return {
            text: msg,
            buttons: [
                btn('1025 Enfermaria'),
                btn('1025 Apartamento'),
                btn('MAIS Enfermaria'),
                btn('MAIS Apartamento'),
            ],
        };
    }

    private async gerarConfirmacao(session: ChatSession): Promise<ChatResponse> {
        const score = this.calcularLeadScore(session);
        await this.updateLead(session.leadId, { leadScore: score, status: 'novo', percentualConclusao: 95 });
        session.step = ChatStep.URGENCIA;
        return {
            text:
                'Obrigado por fornecer seus dados. 🎉\n\n' +
                'Um especialista da Prevent Sênior vai entrar em contato com você para:\n\n' +
                '✔ Confirmar os valores\n' +
                '✔ Apresentar a rede credenciada\n' +
                '✔ Explicar as carências\n' +
                '✔ Finalizar a contratação\n\n' +
                'Para priorizar o seu atendimento, por favor, nos diga qual a sua urgência para contratar o Plano da Prevent Sênior.',
            buttons: [
                btn('Quero Contratar Hoje'),
                btn('Quero Contratar essa Semana'),
                btn('Não tenho Urgência'),
            ],
        };
    }

    private async handleUrgency(session: ChatSession, text: string): Promise<ChatResponse> {
        let urgencia = 'Não informada';
        if (text.includes('hoje')) urgencia = 'Hoje';
        else if (text.includes('semana')) urgencia = 'Esta Semana';
        else if (text.includes('não') || text.includes('urgência') || text.includes('urgencia')) urgencia = 'Sem Urgência';

        session.collectedData.urgencia = urgencia;
        await this.updateLead(session.leadId, { urgencia, status: 'negociacao', percentualConclusao: 100 });
        session.step = ChatStep.FINISHED;

        return {
            text: 'Muito obrigado! 🎉 Já recebemos sua preferência de urgência. Um consultor entrará em contato prioritariamente conforme sua escolha. 💙\n\nCaso precise de mais alguma coisa, é só chamar!'
        };
    }

    private async encaminharEspecialista(session: ChatSession): Promise<ChatResponse> {
        const lead = await prisma.lead.findUnique({ where: { id: session.leadId } });

        // Validação rigorosa do Nome
        const nomeInvalido = !lead?.nome ||
            lead.nome.trim() === '' ||
            lead.nome.startsWith('Visitante Site') ||
            lead.nome.startsWith('WhatsApp');

        // Validação rigorosa do Telefone
        const telefoneValido = lead ? this.isTelefoneValido(lead.telefone) : false;

        if (nomeInvalido) {
            session.step = ChatStep.CAPTURA_NOME;
            session.pendingAction = 'encaminhar';
            return { text: 'Com certeza! Para que o especialista possa te atender melhor, qual o seu *nome completo*?' };
        }

        if (!telefoneValido) {
            session.step = ChatStep.CAPTURA_TELEFONE;
            session.pendingAction = 'encaminhar';
            return { text: `Obrigado, ${lead?.nome?.split(' ')[0]}! Agora, qual o seu *WhatsApp com DDD* para o especialista entrar em contato?\n\nExemplo: 11999999999` };
        }

        await this.updateLead(session.leadId, { status: 'novo', percentualConclusao: 20 });
        session.step = ChatStep.ESPECIALISTA;
        return { text: 'Vou encaminhar você agora para um especialista. Aguarde um momento... ✅\n\nEm breve nossa equipe entrará em contato! 💙' };
    }

    private calcularLeadScore(session: ChatSession): number {
        let score = 0;
        const { titularAge, jaPossuiPlano, dependentCount, planoDesejado } = session.collectedData;
        if (titularAge && titularAge > 55) score += 3;
        if (jaPossuiPlano) score += 3;
        if (dependentCount && dependentCount > 0) score += 2;
        if (planoDesejado === 'Apartamento') score += 2;
        console.log(`[ChatService v4.0] 🏆 Lead score: ${score}`);
        return score;
    }

    // ===== CRUD =====

    async createLead(userId: string, origem: string = 'landing_page'): Promise<string> {
        const lead = await prisma.lead.create({
            data: { userId, origem, telefone: 'web-' + Date.now(), nome: 'Visitante Site', status: 'novo' },
        });
        return lead.id;
    }

    private async updateLead(leadId: string, dados: any) {
        try { await prisma.lead.update({ where: { id: leadId }, data: dados }); }
        catch (error) { console.error(`[ChatService v4.0] ❌ Erro ao atualizar lead ${leadId}:`, error); }
    }

    private async saveInteraction(leadId: string, role: 'user' | 'assistant', content: string) {
        try {
            await prisma.interacao.create({
                data: { leadId, tipo: role === 'user' ? 'mensagem_usuario' : 'mensagem_marIA', descricao: content.substring(0, 500) },
            });
        } catch (error) { console.error('[ChatService v4.0] Erro ao salvar interação:', error); }
    }

    private getFallbackResponse(originalError: string): ChatResponse {
        return {
            text:
                `${originalError}\n\n` +
                'Caso prefira, você pode recomeçar a simulação ou falar agora mesmo com um especialista. 😊',
            buttons: [btn('Recomeçar'), btn('Falar com Especialista')],
        };
    }
}

export const chatService = new ChatService();
