import fs from 'fs';
import path from 'path';
// @ts-ignore
// const { PDFParse } = require('pdf-parse'); // Moved inside function

let cachedPdfContent: string | null = null;
const ARCHIVES_DIR = path.join(__dirname, '../archives');

export const getPdfContent = async (): Promise<string> => {
    if (cachedPdfContent !== null) {
        return cachedPdfContent;
    }

    try {
        console.log(`📂 Lendo arquivos PDF em: ${ARCHIVES_DIR}`);

        if (!fs.existsSync(ARCHIVES_DIR)) {
            console.error(`❌ Diretório de arquivos não encontrado: ${ARCHIVES_DIR}`);
            return '';
        }

        // Filter specifically for the file requested by the user, or fall back to all PDFs
        const TARGET_FILE = 'tabela-valores-prevent-senior.pdf';
        let files = fs.readdirSync(ARCHIVES_DIR).filter(file => file.toLowerCase() === TARGET_FILE.toLowerCase());

        if (files.length === 0) {
            console.warn(`⚠️ Arquivo alvo '${TARGET_FILE}' não encontrado. Carregando todos os PDFs.`);
            files = fs.readdirSync(ARCHIVES_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
        }

        if (files.length === 0) {
            console.warn('⚠️ Nenhum arquivo PDF encontrado na pasta archives.');
            return '';
        }

        let fullContent = '';


        for (const file of files) {
            const filePath = path.join(ARCHIVES_DIR, file);
            console.log(`📄 Processando: ${file}...`);

            try {
                const buffer = fs.readFileSync(filePath);
                const { PDFParse } = require('pdf-parse');
                const parser = new PDFParse({ data: buffer });
                const data = await parser.getText();

                // Limpeza básica
                const text = data.text.replace(/\n\s*\n/g, '\n').trim();

                fullContent += `\n\n--- INÍCIO DO ARQUIVO: ${file} ---\n`;
                fullContent += text;
                fullContent += `\n--- FIM DO ARQUIVO: ${file} ---\n`;

            } catch (err) {
                console.error(`❌ Erro ao ler arquivo ${file}:`, err);
            }
        }

        cachedPdfContent = fullContent;
        console.log(`✅ ${files.length} PDFs carregados. Total: ${cachedPdfContent.length} caracteres.`);

        return cachedPdfContent;

    } catch (error) {
        console.error('❌ Erro geral no loader de PDF:', error);
        return '';
    }
};
