import { PrismaClient } from '@prisma/client';
import { processarMensagemIA } from '../lib/openai';
import OpenAI from 'openai';
import { pricingService } from './pricingService';

const prisma = new PrismaClient();

export enum ChatStep {
    START = 'START',
    AWAITING_NAME = 'AWAITING_NAME',
    AWAITING_PHONE = 'AWAITING_PHONE',
    AWAITING_CURRENT_PLAN = 'AWAITING_CURRENT_PLAN',
    AWAITING_DEPENDENT_CHOICE = 'AWAITING_DEPENDENT_CHOICE',
    AWAITING_DEPENDENT_COUNT = 'AWAITING_DEPENDENT_COUNT',
    AWAITING_TITULAR_AGE = 'AWAITING_TITULAR_AGE',
    AWAITING_DEPENDENT_AGES = 'AWAITING_DEPENDENT_AGES',
    AWAITING_CITY = 'AWAITING_CITY',
    AWAITING_PLAN_SELECTION = 'AWAITING_PLAN_SELECTION',
    FINISHED = 'FINISHED'
}

export interface ChatSession {
    leadId: string;
    step: ChatStep;
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    lastInteraction: number;
    collectedData: {
        nome?: string;
        jaPossuiPlano?: string;
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
                step: ChatStep.START,
                history: [],
                lastInteraction: Date.now(),
                collectedData: {
                    dependentAges: [],
                    currentDependentIndex: 0
                }
            };
            sessions.set(leadId, session);
        }
        return session;
    }

    async processUserMessage(leadId: string, messageText: string): Promise<string> {
        const session = await this.getOrCreateSession(leadId);
        session.lastInteraction = Date.now();

        if (messageText) {
            session.history.push({ role: 'user', content: messageText });
            await this.saveInteraction(leadId, 'user', messageText);
        }

        try {
            switch (session.step) {
                case ChatStep.START: {
                    session.step = ChatStep.AWAITING_NAME;
                    const msgIntro = "Olá! Eu sou a MarIA, especialista digital da Prevent Sênior 💙\n\n" +
                        "A Prevent Sênior é a operadora especialista no Adulto+, oferecendo:\n" +
                        "• Rede própria de alta qualidade (Hospitais Sancta Maggiore)\n" +
                        "• Sem reajuste por faixa etária a partir dos 50 anos\n" +
                        "• Programas de medicina preventiva exclusivos\n" +
                        "• Atendimento humano e especializado\n\n" +
                        "Para começarmos sua cotação, qual o seu **Nome Completo**?";

                    await this.saveInteraction(leadId, 'assistant', msgIntro);
                    return msgIntro;
                }

                case ChatStep.AWAITING_NAME: {
                    session.collectedData.nome = messageText;
                    await this.updateLead(leadId, { nome: messageText });

                    session.step = ChatStep.AWAITING_CURRENT_PLAN;
                    return "Prazer em conhecer você! 😊\n\nVocê já possui algum plano de saúde atualmente? Se sim, qual?";
                }

                case ChatStep.AWAITING_PHONE: {
                    // Limpar caracteres não numéricos
                    const phone = messageText.replace(/\D/g, '');
                    if (phone.length < 10) {
                        return "Por favor, informe seu WhatsApp com DDD (ex: 11999999999).";
                    }

                    await this.updateLead(leadId, { telefone: phone });

                    session.step = ChatStep.FINISHED;
                    return this.getFinalMessage(leadId);
                }

                case ChatStep.AWAITING_CURRENT_PLAN: {
                    session.collectedData.jaPossuiPlano = messageText;
                    await this.updateLead(leadId, { jaPossuiPlano: messageText });

                    session.step = ChatStep.AWAITING_DEPENDENT_CHOICE;
                    const msg = "Entendido. Este plano seria somente para você ou deseja incluir esposa(o) e dependentes?";
                    return msg;
                }

                case ChatStep.AWAITING_DEPENDENT_CHOICE: {
                    const text = messageText.toLowerCase();
                    if (text.includes('somente') || text.includes('apenas') || text.includes('só') || text.includes('individual') || (text.includes('não') && !text.includes('sim'))) {
                        session.collectedData.isIndividual = true;
                        session.collectedData.dependentCount = 0;
                        session.step = ChatStep.AWAITING_TITULAR_AGE;
                        return "Combinado. Qual é a sua idade?";
                    } else {
                        session.collectedData.isIndividual = false;
                        session.step = ChatStep.AWAITING_DEPENDENT_COUNT;
                        return "Certo! Além de você, quantas pessoas a mais deseja incluir no plano?";
                    }
                }

                case ChatStep.AWAITING_DEPENDENT_COUNT: {
                    const count = parseInt(messageText.replace(/\D/g, ''));
                    if (isNaN(count) || count < 0) {
                        return "Por favor, informe apenas o número de dependentes (ex: 1, 2...).";
                    }
                    session.collectedData.dependentCount = count;
                    await this.updateLead(leadId, { dependentes: count });

                    session.step = ChatStep.AWAITING_TITULAR_AGE;
                    return "Entendido. Qual é a sua idade (Titular)?";
                }

                case ChatStep.AWAITING_TITULAR_AGE: {
                    const age = parseInt(messageText.replace(/\D/g, ''));
                    if (isNaN(age) || age < 0 || age > 120) {
                        return "Por favor, informe uma idade válida (número inteiro).";
                    }
                    session.collectedData.titularAge = age;
                    await this.updateLead(leadId, { idade: age });

                    if (session.collectedData.dependentCount && session.collectedData.dependentCount > 0) {
                        session.step = ChatStep.AWAITING_DEPENDENT_AGES;
                        session.collectedData.currentDependentIndex = 1;
                        return `Qual a idade do seu 1º dependente?`;
                    } else {
                        session.step = ChatStep.AWAITING_CITY;
                        return "E para finalizar, em qual cidade você mora?";
                    }
                }

                case ChatStep.AWAITING_DEPENDENT_AGES: {
                    const age = parseInt(messageText.replace(/\D/g, ''));
                    if (isNaN(age) || age < 0 || age > 120) {
                        return "Por favor, informe uma idade válida.";
                    }

                    session.collectedData.dependentAges.push(age);
                    const currentIndex = session.collectedData.currentDependentIndex;
                    const totalNeeded = session.collectedData.dependentCount || 0;

                    if (currentIndex < totalNeeded) {
                        session.collectedData.currentDependentIndex++;
                        return `Qual a idade do seu ${session.collectedData.currentDependentIndex}º dependente?`;
                    } else {
                        await this.updateLead(leadId, { idadesDependentes: session.collectedData.dependentAges });

                        let confirmMsg = "Perfeito. Registrei as idades: \n" +
                            `- Titular: ${session.collectedData.titularAge} anos\n`;
                        session.collectedData.dependentAges.forEach((a, i) => {
                            confirmMsg += `- Dependente ${i + 1}: ${a} anos\n`;
                        });

                        session.step = ChatStep.AWAITING_CITY;
                        confirmMsg += "\nQual cidade você mora?";
                        return confirmMsg;
                    }
                }

                case ChatStep.AWAITING_CITY: {
                    session.collectedData.cidade = messageText;
                    await this.updateLead(leadId, { cidade: messageText });

                    const ages = [session.collectedData.titularAge!, ...session.collectedData.dependentAges];
                    const quotes = pricingService.buildQuote(ages);

                    let response = "Excelente! Calculei as melhores opções para você na Prevent Sênior:\n\n";

                    response += "🟢 **Opção 1:**\n";
                    response += pricingService.formatQuote(quotes.enfermaria);

                    response += "\n🔵 **Opção 2:**\n";
                    response += pricingService.formatQuote(quotes.apartamento);

                    response += "\n**Quer seguir com qual opção (Enfermaria ou Apartamento) para eu encaminhar para fechamento?**";

                    session.step = ChatStep.AWAITING_PLAN_SELECTION;
                    return response;
                }

                case ChatStep.AWAITING_PLAN_SELECTION: {
                    const choice = messageText.toLowerCase();
                    const ages = [session.collectedData.titularAge!, ...session.collectedData.dependentAges];
                    const quotes = pricingService.buildQuote(ages);

                    if (choice.includes('enfermaria')) {
                        const valor = quotes.enfermaria.total;
                        session.collectedData.planoDesejado = "Enfermaria";
                        session.collectedData.valorPlano = valor;

                        // Atualizar dados básicos
                        await this.updateLead(leadId, {
                            planoDesejado: "Enfermaria",
                            valorPlano: valor,
                            valorEstimado: valor,
                            status: 'negociacao',
                            percentualConclusao: 90 // Quase lá
                        });

                        // Verificar se precisa de telefone (apenas se for site e ainda for placeholder)
                        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
                        const needsPhone = lead?.origem !== 'whatsapp' && lead?.telefone.startsWith('web-');

                        if (needsPhone) {
                            session.step = ChatStep.AWAITING_PHONE;
                            return "Ótima escolha! O plano Enfermaria oferece um excelente custo-benefício com toda a qualidade Prevent Sênior.\n\nPara finalizarmos, qual o seu **WhatsApp com DDD** para nosso especialista entrar em contato?";
                        } else {
                            session.step = ChatStep.FINISHED;
                            return this.getFinalMessage(leadId, "Ótima escolha! O plano Enfermaria oferece um excelente custo-benefício com toda a qualidade Prevent Sênior.");
                        }
                    } else if (choice.includes('apartamento')) {
                        const valor = quotes.apartamento.total;
                        session.collectedData.planoDesejado = "Apartamento";
                        session.collectedData.valorPlano = valor;

                        await this.updateLead(leadId, {
                            planoDesejado: "Apartamento",
                            valorPlano: valor,
                            valorEstimado: valor,
                            status: 'negociacao',
                            percentualConclusao: 90
                        });

                        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
                        const needsPhone = lead?.origem !== 'whatsapp' && lead?.telefone.startsWith('web-');

                        if (needsPhone) {
                            session.step = ChatStep.AWAITING_PHONE;
                            return "Excelente escolha! O plano Apartamento garante total privacidade e conforto nos Hospitais Sancta Maggiore.\n\nPara finalizarmos, qual o seu **WhatsApp com DDD** para nosso especialista entrar em contato?";
                        } else {
                            session.step = ChatStep.FINISHED;
                            return this.getFinalMessage(leadId, "Excelente escolha! O plano Apartamento garante total privacidade e conforto nos Hospitais Sancta Maggiore.");
                        }
                    } else {
                        return "Por favor, digite *Enfermaria* ou *Apartamento* para prosseguirmos com seu fechamento.";
                    }
                }

                case ChatStep.FINISHED: {
                    return "Seu atendimento já foi encaminhado para um de nossos especialistas. Se precisar de mais alguma coisa, estou à disposição!";
                }

                default:
                    return "Desculpe, me perdi um pouco. Pode repetir?";
            }
        } catch (error) {
            console.error('❌ Erro no ChatService:', error);
            return "Erro interno ao processar mensagem.";
        }
    }

    async createLead(userId: string, origem: string = 'web'): Promise<string> {
        console.log(`[ChatService] 🆕 Criando novo lead para userId: ${userId}, origem: ${origem}`);
        try {
            const lead = await prisma.lead.create({
                data: {
                    userId,
                    origem,
                    telefone: 'web-' + Date.now(), // Placeholder
                    nome: 'Visitante Site',
                    status: 'novo'
                }
            });
            console.log(`[ChatService] ✅ Lead criado com ID: ${lead.id}`);
            return lead.id;
        } catch (error) {
            console.error('[ChatService] ❌ Erro ao criar lead no banco:', error);
            throw error;
        }
    }

    private async getFinalMessage(leadId: string, customIntro?: string): Promise<string> {
        try {
            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            const isSite = lead?.origem !== 'whatsapp';

            const intro = customIntro ? customIntro + "\n\n" : "Perfeito! Já guardei seu contato.\n\n";

            if (isSite) {
                return intro + "Fique tranquilo, nosso especialista vai entrar em contato com você pelo WhatsApp que você informou em breve para finalizarmos tudo! 🚀💙";
            } else {
                return intro + "Para finalizarmos, envie para nosso WhatsApp uma foto do seu RG/CNH, Comprovante de Residência e Cartão do SUS. Nosso especialista vai entrar em contato em breve para confirmar o cadastro.";
            }
        } catch (error) {
            console.error('[ChatService] Erro ao gerar mensagem final:', error);
            return "Obrigado! Em breve nosso especialista entrará em contato.";
        }
    }

    private async updateLead(leadId: string, dados: any) {
        try {
            console.log(`[ChatService] Atualizando lead ${leadId} com dados:`, JSON.stringify(dados));
            await prisma.lead.update({
                where: { id: leadId },
                data: dados
            });
            console.log(`[ChatService] Lead ${leadId} atualizado com sucesso!`);
        } catch (error) {
            console.error(`[ChatService] ❌ Erro ao atualizar lead ${leadId}:`, error);
        }
    }

    private async saveInteraction(leadId: string, role: 'user' | 'assistant', content: string) {
        // Log ou persistência de mensagens
    }
}

export const chatService = new ChatService();
