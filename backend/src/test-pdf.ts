import { getPdfContent } from './services/pdfLoader';

const test = async () => {
    console.log('🏁 Iniciando teste do PDF...');
    const content = await getPdfContent();
    console.log('✅ Conteúdo extraído:');
    console.log(content.substring(0, 500) + '...'); // Mostrar apenas os primeiros 500 chars
};

test();
