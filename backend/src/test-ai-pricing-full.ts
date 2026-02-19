
import { processarMensagemIA } from './lib/openai';

async function testPricingFull() {
    console.log("Testing AI pricing retrieval with full context...");

    // Simulate a conversation where the user has provided all necessary details
    const history = [
        { role: 'user', content: 'Olá, gostaria de saber valores.' },
        { role: 'assistant', content: 'Olá! Sou a MarIA. Qual é o seu nome?' },
        { role: 'user', content: 'João Silva' },
        { role: 'assistant', content: 'Prazer, João. Qual a sua idade?' },
        { role: 'user', content: 'Tenho 60 anos' },
        { role: 'assistant', content: 'Certo. Qual sua cidade?' },
        { role: 'user', content: 'São Paulo' },
        { role: 'assistant', content: 'Já possui algum plano de saúde?' },
        { role: 'user', content: 'Não' },
        { role: 'assistant', content: 'Tem dependentes? Se sim, quais as idades?' },
        { role: 'user', content: 'Não tenho dependentes, é só para mim.' },
        { role: 'assistant', content: 'Obrigada. Por último, qual seu email?' },
        { role: 'user', content: 'joao@teste.com' }
    ];

    try {
        // First call: Expecting tool call to save data
        let response: any = await processarMensagemIA(history as any);
        console.log("First Response Type:", response.tipo);

        if (response.tipo === 'ATUALIZAR') {
            console.log("Tool called. Simulating tool output...");
            // Add tool call message to history
            history.push(response.msg);

            // Add tool output message
            if (response.msg.tool_calls) {
                for (const toolCall of response.msg.tool_calls) {
                    history.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: true, message: "Dados salvos." })
                    } as any);
                }
            }

            // Second call: Expecting pricing text
            console.log("Calling OpenAI again with tool outputs...");
            response = await processarMensagemIA(history as any);
            console.log("Second Response Type:", response.tipo);
            console.log("Final Text:", response.texto);
        }

        if (response.texto && (response.texto.includes("1.315") || response.texto.includes("1315"))) {
            console.log("✅ SUCCESS: AI found the correct price (approx 1315).");
        } else {
            console.log("❌ FAILURE: AI did not return the expected price.");
            console.log("Expected: ~1315");
            console.log("Got: ", response.texto);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testPricingFull();
