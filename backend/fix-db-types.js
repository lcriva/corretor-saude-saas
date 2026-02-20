const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🛠️ [SERVER FIX] Iniciando correção DEFINITIVA no banco de dados...');

    try {
        // Drop e Add é o caminho mais seguro se a conversão falha
        console.log('⏳ Removendo coluna problematica (se existir)...');
        await prisma.$executeRawUnsafe(`ALTER TABLE leads DROP COLUMN IF EXISTS "jaPossuiPlano";`);

        console.log('⏳ Recriando coluna como TEXT...');
        await prisma.$executeRawUnsafe(`ALTER TABLE leads ADD COLUMN "jaPossuiPlano" TEXT;`);

        console.log('✅ Banco de dados ATUALIZADO com sucesso!');

    } catch (error) {
        console.error('❌ Erro CRÍTICO ao corrigir banco:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
