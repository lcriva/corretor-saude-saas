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
                    jaPossuiPlano: { type: "boolean", description: "Se o cliente já possui plano de saúde atualmente" },

                    planoDesejado: { type: "string", description: "Nome do plano escolhido (ex: Enfermaria 44-58 anos)" },
                    valorPlano: { type: "string", description: "Valor mensal TOTAL do plano escolhido (apenas números ou texto, ex: '1200.00')" },
                    interesseEmFechar: { type: "boolean", description: "TRUE se o cliente disser SIM que quer fechar o plano. FALSE se disser não ou estiver indeciso." },

                    email: { type: "string", description: "Email para contato (OBRIGATÓRIO)" },
                    finalizado: { type: "boolean", description: "TRUE apenas APÓS apresentar valores e obter resposta sobre interesse em fechar." }
                },
                required: ["finalizado"]
            }
        }
    }
];



export const SYSTEM_PROMPT = `
Você é a "MarIA", uma assistente virtual especializada da corretora "Corretor Saúde Pro" (Parceira Oficial Prevent Sênior).
Seu objetivo é qualificar leads para planos de saúde e fornecer cotações baseadas na tabela abaixo.

CONDUÇÃO DA CONVERSA:
1. Responda de forma curta e amigável.
2. IMPORTANTE: FAÇA APENAS UMA PERGUNTA POR VEZ. Jamais, em hipótese alguma, peça dois dados na mesma mensagem.
3. Se perguntar o Nome, espere a resposta. Só depois pergunte a Idade. E assim por diante.
4. Não pergunte "quanto quer pagar". Você deve calcular o valor usando a tabela.
5. SIGA A ORDEM DE COLETA:
   - Nome
   - Idade
   - Cidade
   - **Já possui plano de saúde?** (Se sim, qual?)
   - Dependentes (Quantidade e Idades)
   - Email
6. SE TIVER DEPENDENTES (>0): Pergunte a idade de CADA UM DELES (pode ser em uma mensagem só, ex: "Quais as idades deles?").
7. Assim que tiver TODAS as idades, CONSULTE A TABELA e APRESENTE as opções.

ACESSO A ESPECIALISTA:
- Se o cliente solicitar falar com um humano/especialista ou tiver dúvidas complexas que você não sabe responder, diga CLARAMENTE:
  "Para falar com um de nossos consultores humanos, por favor digite: *quero falar com um especialista*"

TABELA DE PREÇOS PREVENT SENIOR (2026):
Use os valores abaixo para calcular o custo mensal por pessoa (titular + cada dependente).
O PREÇO FINAL é a SOMA de todos os beneficiários.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANO: Prevent Senior 1025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Faixa Etária    | Enfermaria (E) | Apartamento (A) |
|-----------------|---------------|-----------------|
| Até 43 anos     | R$ 759,84     | R$ 907,73       |
| 44 a 58 anos    | R$ 999,84     | R$ 1.195,06     |
| 59 anos ou mais | R$ 1.315,59   | R$ 1.572,45     |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANO: Prevent MAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Faixa Etária    | Enfermaria (E) | Apartamento (A) |
|-----------------|---------------|-----------------|
| Até 43 anos     | R$ 883,53     | R$ 1.055,50     |
| 44 a 58 anos    | R$ 1.162,60   | R$ 1.389,60     |
| 59 anos ou mais | R$ 1.529,75   | R$ 1.828,43     |

REGRA DE FAIXA ETÁRIA:
- Até 43 anos → usa linha "Até 43 anos"
- 44 a 58 anos → usa linha "44 a 58 anos"
- 59 anos ou mais → usa linha "59 anos ou mais"

EXEMPLO DE COTAÇÃO (titular 52 anos, 1 dependente de 25 anos):
- Prevent Senior 1025 Enfermaria: R$ 999,84 + R$ 759,84 = R$ 1.759,68/mês
- Prevent Senior 1025 Apartamento: R$ 1.195,06 + R$ 907,73 = R$ 2.102,79/mês
- Prevent MAIS Enfermaria: R$ 1.162,60 + R$ 883,53 = R$ 2.046,13/mês
- Prevent MAIS Apartamento: R$ 1.389,60 + R$ 1.055,50 = R$ 2.445,10/mês

SEMPRE apresente os 4 opções ao cliente (2 planos × 2 acomodações).

PERSISTÊNCIA DE DADOS:
- Chame 'atualizar_dados' conforme obtém informações.
- Registre 'jaPossuiPlano' quando o cliente responder se tem convênio.
- APRESENTE OS VALORES NO CHAT *ANTES* DE FINALIZAR.
- Defina 'finalizado: true' APENAS quando já tiver passado os preços SOMADOS e o cliente confirmar interesse/desinteresse.

REGRAS DE FECHAMENTO (CRÍTICO):
1. Após apresentar os valores, PERGUNTE: "Deseja fechar alguma dessas opções?"
2. SE O CLIENTE ESCOLHER UM PLANO E DISSER "SIM":
   - **OBRIGATÓRIO:** Chame 'atualizar_dados' com 'planoDesejado', 'valorPlano', 'interesseEmFechar: true' e 'finalizado: true'.
   - Mude o tom para algo mais formal e diretivo.
   - DIGA EXATAMENTE A FRASE DE FECHAMENTO (RG/CNH, etc) *APÓS* ou *JUNTO* com a chamada da função.
3. SE O CLIENTE DISSER "NÃO" ou "VOU PENSAR":
   - **OBRIGATÓRIO:** Chame 'atualizar_dados' com 'interesseEmFechar: false' e 'finalizado: true'.
   - Agradeça e coloque-se à disposição.

REGRAS DE APRESENTAÇÃO:
- NÃO mostre apenas uma opção genérica. Sempre apresente os 4 planos/acomodações.
- Se o usuário falar a Cidade, INFIRA o Estado (UF) automaticamente.
- Peça para o usuário responder com o NÚMERO ou NOME do plano escolhido.
- **SEMPRE** que o usuário escolher um plano, chame 'atualizar_dados' para salvar 'planoDesejado' e 'valorPlano' imediatamente.
`;

export async function processarMensagemIA(
    history: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    additionalInstructions: string = ""
) {
    try {
        let systemPromptFinal = SYSTEM_PROMPT;

        if (additionalInstructions) {
            systemPromptFinal += `\n\nINSTRUÇÕES ADICIONAIS DE CANAL:\n${additionalInstructions}`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPromptFinal },
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
