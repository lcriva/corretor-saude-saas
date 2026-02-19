
import { processarMensagemIA } from './lib/openai';

async function testPricing() {
    console.log("Testing AI pricing retrieval...");
    const history = [
        { role: 'user', content: 'Tenho 60 anos, qual o valor do plano?' }
    ];

    try {
        const response: any = await processarMensagemIA(history as any);
        console.log("AI Response:", response.texto || response.msg.content);

        if (response.texto && response.texto.includes("1.315") || response.texto.includes("1315")) {
            console.log("✅ SUCCESS: AI found the correct price.");
        } else {
            console.log("❌ FAILURE: AI did not return the expected price (approx 1315).");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testPricing();
