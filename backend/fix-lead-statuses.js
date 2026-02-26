const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando correção de status de leads...');

    // Leads Frios (incompletos) devem ser 'novo'
    const result = await prisma.lead.updateMany({
        where: {
            percentualConclusao: { lt: 100 },
            status: 'negociacao'
        },
        data: {
            status: 'novo'
        }
    });

    console.log(`✅ ${result.count} leads corrigidos para o status "novo" (estavam incompletos).`);
}

main()
    .catch(e => {
        console.error('❌ Erro durante a correção:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
