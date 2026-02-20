const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Iniciando limpeza da base de leads...');

    try {
        // Devido ao Cascade no Prisma, deletar os Leads removerá também Interações e Propostas vinculadas
        const result = await prisma.lead.deleteMany({});

        console.log(`✅ Sucesso! ${result.count} leads foram removidos da base.`);
        console.log('✨ A base agora está limpa para novos testes.');

    } catch (error) {
        console.error('❌ Erro ao limpar a base de leads:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
