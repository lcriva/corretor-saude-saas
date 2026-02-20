const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🛠️ Iniciando correção de tipos no banco de dados...');

    try {
        // Alterar coluna de BOOLEAN para TEXT
        // Usamos USING "jaPossuiPlano"::text para converter valores existentes (true/false) para string ("true"/"false")
        await prisma.$executeRawUnsafe(`
            ALTER TABLE leads 
            ALTER COLUMN "jaPossuiPlano" TYPE TEXT 
            USING CASE 
                WHEN "jaPossuiPlano" = true THEN 'Sim' 
                WHEN "jaPossuiPlano" = false THEN 'Não' 
                ELSE NULL 
            END;
        `);
        console.log('✅ Coluna "jaPossuiPlano" convertida para TEXT com sucesso!');

        // Garantir que idadesDependentes é JSONB (já está, mas por segurança)
        await prisma.$executeRawUnsafe(`
            ALTER TABLE leads 
            ALTER COLUMN "idadesDependentes" TYPE JSONB 
            USING "idadesDependentes"::jsonb;
        `);
        console.log('✅ Coluna "idadesDependentes" garantida como JSONB!');

    } catch (error) {
        console.error('❌ Erro ao executar SQL de correção:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
