import { PrismaClient } from '@prisma/client';
import { processarMensagemIA } from '../lib/openai';
import OpenAI from 'openai';

const prisma = new PrismaClient();

export interface ChatSession {
    leadId: string;
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    lastInteraction: number;
}

// Mapa em memória para sessões de chat (pode ser substituído por Redis/DB no futuro)
// Chave: leadId, Valor: Sessão
const sessions = new Map<string, ChatSession>();

export class ChatService {

    async getOrCreateSession(leadId: string): Promise<ChatSession> {
        let session = sessions.get(leadId);

        if (!session) {
            // Tentar recuperar histórico do banco (opcional, por enquanto inicia vazio ou com system)
            // Se fosse persistente ideal, leríamos tabela 'Interacao'
            session = {
                leadId,
                history: [],
                lastInteraction: Date.now()
            };
            sessions.set(leadId, session);
        }
        return session;
    }

    async processUserMessage(leadId: string, messageText: string): Promise<string> {
        const session = await this.getOrCreateSession(leadId);

        // 1. Adicionar mensagem do usuário
        if (messageText) {
            session.history.push({ role: 'user', content: messageText });
            // Salvar interação no banco (opcional para log)
            await this.saveInteraction(leadId, 'user', messageText);
        }

        let loopCount = 0;
        const MAX_LOOPS = 5;
        let finalResponseText = '';

        try {
            while (loopCount < MAX_LOOPS) {
                loopCount++;
                console.log(`🔄 ChatService Loop ${loopCount}/${MAX_LOOPS} - Lead: ${leadId}`);

                // Timeout de 20s
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('TIMEOUT_OPENAI')), 20000)
                );

                let respostaIA: any;
                try {
                    const webInstructions = "CANAL: SITE/WEBCHAT. \nPRIORIDADE 0: Você DEVE pedir o Telefone (WhatsApp) do cliente IMEDIATAMENTE no início da conversa, antes de perguntar o nome ou idade. \nExplique que é para o caso da conexão cair. \nSÓ DEPOIS de ter o telefone, prossiga para o Nome e os outros dados.";

                    respostaIA = await Promise.race([
                        processarMensagemIA(session.history, webInstructions),
                        timeoutPromise
                    ]);
                } catch (timeoutErr: any) {
                    console.error('⏱️ Timeout OpenAI');
                    return "Estou demorando um pouco para pensar... Tente novamente em instantes.";
                }

                if (respostaIA.msg) {
                    session.history.push(respostaIA.msg);
                }

                if (respostaIA.tipo === 'RESPOSTA' && respostaIA.texto) {
                    finalResponseText = respostaIA.texto;
                    await this.saveInteraction(leadId, 'assistant', finalResponseText);
                    return finalResponseText;

                } else if (respostaIA.tipo === 'ATUALIZAR' && respostaIA.dados) {
                    console.log('🤖 Atualizando dados do lead:', respostaIA.dados);
                    await this.updateLead(leadId, respostaIA.dados);

                    // Se finalizar
                    if (respostaIA.dados.finalizado) {
                        // Pode gerar uma mensagem final especial
                    }

                    // Devolver output da tool
                    if (respostaIA.msg && respostaIA.msg.tool_calls) {
                        for (const toolCall of respostaIA.msg.tool_calls) {
                            session.history.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ success: true, message: "Dados salvos." })
                            } as any);
                        }
                    }
                    continue; // Próximo loop
                } else if (respostaIA.tipo === 'ERRO') {
                    return "Desculpe, tive um erro técnico.";
                }

                break;
            }
        } catch (error) {
            console.error('❌ Erro no ChatService:', error);
            return "Erro interno ao processar mensagem.";
        }

        return finalResponseText || "Não entendi, pode repetir?";
    }

    async createLead(userId: string, origem: string = 'web'): Promise<string> {
        const lead = await prisma.lead.create({
            data: {
                userId,
                origem,
                telefone: 'web-' + Date.now(), // Placeholder
                nome: 'Visitante Site',
                status: 'novo'
            }
        });
        return lead.id;
    }

    private async updateLead(leadId: string, dados: any) {
        try {
            // Converter idadesDependentes para JSON se necessário ou manter array
            // O prisma schema espera Json? Sim.

            // Remover 'finalizado' e limpeza básica
            // Remover 'finalizado'
            const { finalizado, valorPlano, ...dadosUt } = dados;

            const dataToUpdate: any = {
                ...dadosUt
            };

            // Tratamento especial para valorPlano (String -> Float)
            if (valorPlano) {
                if (typeof valorPlano === 'string') {
                    // Remove R$, espaços e troca vírgula por ponto
                    const cleanValue = valorPlano.replace(/[R$\s]/g, '').replace(',', '.');
                    const parsed = parseFloat(cleanValue);
                    if (!isNaN(parsed)) {
                        dataToUpdate.valorPlano = parsed;
                        dataToUpdate.valorEstimado = parsed; // Manter compatibilidade
                    }
                } else if (typeof valorPlano === 'number') {
                    dataToUpdate.valorPlano = valorPlano;
                    dataToUpdate.valorEstimado = valorPlano;
                }
            }

            if (dadosUt.percentualConclusao) {
                dataToUpdate.percentualConclusao = dadosUt.percentualConclusao;
            }

            console.log('📝 Persistindo dados no banco:', dataToUpdate);

            await prisma.lead.update({
                where: { id: leadId },
                data: dataToUpdate
            });
        } catch (error) {
            console.error('Erro ao atualizar lead:', error);
        }
    }

    private async saveInteraction(leadId: string, role: 'user' | 'assistant', content: string) {
        // Implementar se tiver tabela de interação acessível
        // await prisma.interacao.create(...)
    }
}

export const chatService = new ChatService();
