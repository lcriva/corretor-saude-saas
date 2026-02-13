import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não encontrada no .env');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Definição da Ferramenta (Function Calling)
const tools = [
    {
        type: "function" as const,
        function: {
            name: "atualizar_dados",
            description: "Chame esta função SEMPRE que usuário fornecer NOVAS informações, mesmo que incompletas. Chame também ao final para confirmar tudo.",
            parameters: {
                type: "object",
                properties: {
                    nome: { type: "string", description: "Nome completo do cliente" },
                    telefone: { type: "string", description: "Telefone/WhatsApp do cliente (apenas números)" },
                    idade: { type: "number", description: "Idade do cliente (em anos)" },
                    cidade: { type: "string", description: "Cidade onde reside" },
                    estado: { type: "string", description: "Estado (UF) ex: SP, RJ, MG" },
                    dependentes: { type: "number", description: "Quantidade de dependentes (0 se for individual)" },
                    idadesDependentes: { type: "array", items: { type: "number" }, description: "Lista com as idades dos dependentes, se houver. Ex: [5, 12, 40]" },

                    planoDesejado: { type: "string", description: "Nome do plano escolhido (ex: Enfermaria 44-58 anos)" },
                    valorPlano: { type: "string", description: "Valor mensal TOTAL do plano escolhido (apenas números ou texto, ex: '1200.00')" },

                    email: { type: "string", description: "Email para contato (OBRIGATÓRIO)" },
                    finalizado: { type: "boolean", description: "TRUE apenas APÓS você ter apresentado os valores da tabela e o usuário concordar em prosseguir. FALSE caso contrário." }
                },
                required: ["finalizado"]
            }
        }
    }
];

import { getPdfContent } from '../services/pdfLoader';

export const SYSTEM_PROMPT = `
Você é a "Ana", uma assistente virtual especializada da corretora "Corretor Saúde Pro".
Seu objetivo é qualificar leads para planos de saúde (Prevent Sênior) e fornecer cotações baseadas na tabela anexa.

CONDUÇÃO DA CONVERSA:
1. Responda de forma curta e amigável.
2. IMPORTANTE: FAÇA APENAS UMA PERGUNTA POR VEZ. Jamais, em hipótese alguma, peça dois dados na mesma mensagem.
3. Se perguntar o Nome, espere a resposta. Só depois pergunte a Idade. E assim por diante.
4. Não pergunte "quanto quer pagar". Você deve calcular o valor usando a tabela.
5. SIGA A ORDEM DE COLETA ESPECÍFICA DO CANAL (Se houver instrução extra). Se não, o padrão é: Nome -> Idade -> Cidade -> Dependentes.
6. SE TIVER DEPENDENTES (>0): Pergunte a idade de CADA UM DELES (pode ser em uma mensagem só, ex: "Quais as idades deles?").
7. Por fim, peça o Email.
8. Assim que tiver TODAS as idades (titular + dependentes), CONSULTA A TABELA e APRESENTE as opções.

TABELA DE PREÇOS (PREVENT SÊNIOR):
Use as informações abaixo para encontrar o valor exato para a idade do titular e de cada dependente.
O PREÇO FINAL DEVE SER A SOMA DE TODOS (Titular + Dependentes).
---
{{PDF_CONTENT}}
---

PERSISTÊNCIA DE DADOS:
- Chame 'atualizar_dados' conforme obtém informações.
- Registre as idades dos dependentes no campo 'idadesDependentes' da ferramenta.
- APRESENTE OS VALORES NO CHAT *ANTES* DE FINALIZAR.
- Defina 'finalizado: true' APENAS quando já tiver passado os preços SOMADOS, o cliente demonstrou interesse e você tem todos os dados.

CÁLCULO DETALHADO OBRIGATÓRIO PARA **TODOS** OS PLANOS:
Você DEVE consultar a tabela e encontrar TODOS os planos disponíveis (Ex: Prevent 1000, Prevent 500, Prevent Sênior, etc).
Para CADA UM DELES, apresente a conta detalhada:

1. **[Nome do Plano A]**
   - Titular (X anos): R$ ...
   - Dependente 1 (Y anos): R$ ...
   - **TOTAL: R$ ...**

2. **[Nome do Plano B]**
   - Titular (X anos): R$ ...
   - Dependente 1 (Y anos): R$ ...
   - **TOTAL: R$ ...**

(Repita para 3 ou 4 opções diferentes)

REGRAS DE APRESENTAÇÃO:
- NÃO mostre apenas uma opção genérica. O cliente quer ver os níveis (Enfermaria, Apartamento, etc).
- Se o usuário falar a Cidade, INFIRA o Estado (UF) automaticamente.
- Peça para o usuário responder com o NÚMERO ou NOME do plano escolhido.
`;

export async function processarMensagemIA(
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    additionalInstructions: string = ""
) {
    try {
        const pdfContent = await getPdfContent();
        let systemPromptWithPdf = SYSTEM_PROMPT.replace('{{PDF_CONTENT}}', pdfContent);

        if (additionalInstructions) {
            systemPromptWithPdf += `\n\nINSTRUÇÕES ADICIONAIS DE CANAL:\n${additionalInstructions}`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPromptWithPdf },
                ...history
            ],
            tools: tools,
            tool_choice: "auto",
            temperature: 0.7,
        });

        const message = response.choices[0].message;
        console.log('🤖 OpenAI Raw Response:', JSON.stringify(message, null, 2)); // DEBUG LOG

        if (message.tool_calls && message.tool_calls.length > 0) {
            let dadosCompletos: any = {};
            let hasUpdate = false;

            for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === 'atualizar_dados') {
                    try {
                        const dadosParciais = JSON.parse(toolCall.function.arguments);
                        dadosCompletos = { ...dadosCompletos, ...dadosParciais };
                        hasUpdate = true;
                    } catch (jsonError) {
                        console.error('❌ ERRO JSON.PARSE para toolCall:', toolCall.id, jsonError);
                    }
                }
            }

            if (hasUpdate) {
                return {
                    tipo: 'ATUALIZAR',
                    dados: dadosCompletos, // Retorna dados mesclados de todas as chamadas
                    msg: message // Retornar objeto completo para histórico
                };
            }
        }

        // Se não, retorna a resposta de texto da IA
        return {
            tipo: 'RESPOSTA',
            texto: message.content,
            msg: message // Retornar objeto completo
        };

    } catch (error: any) {
        console.error('❌ Erro na OpenAI:', error);
        // Retornar o erro detalhado para debug
        return {
            tipo: 'ERRO',
            texto: `Desculpa, tive um pequeno problema técnico. Pode repetir? (Erro: ${error.message})`
        };

    }
}
