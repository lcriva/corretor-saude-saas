import fs from 'fs';
import path from 'path';
// @ts-ignore
const { PDFParse } = require('pdf-parse');

let cachedPdfContent: string | null = null;
const PDF_PATH = path.join(__dirname, '../archives/tabela-valores-prevent-senior.pdf');

export const getPdfContent = async (): Promise<string> => {
    if (cachedPdfContent !== null) {
        return cachedPdfContent;
    }

    try {
        console.log('📄 Lendo arquivo PDF da tabela de preços...');

        if (!fs.existsSync(PDF_PATH)) {
            console.error(`❌ Arquivo PDF não encontrado em: ${PDF_PATH}`);
            return '';
        }

        const buffer = fs.readFileSync(PDF_PATH);
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();

        // Limpar o texto para remover espaços excessivos e caracteres estranhos
        cachedPdfContent = data.text
            .replace(/\n\s*\n/g, '\n') // Remove linhas vazias excessivas
            .trim();

        if (!cachedPdfContent) {
            cachedPdfContent = '';
        }

        console.log(`✅ PDF carregado: ${cachedPdfContent.length} caracteres.`);
        return cachedPdfContent;
    } catch (error) {
        console.error('❌ Erro ao ler PDF:', error);
        return '';
    }
};
