const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, nome: u.nome })), null, 2));

    console.log('\n--- LEADS TABLE STRUCTURE ---');
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'leads'
            ORDER BY column_name;
        `;
        console.table(columns);
    } catch (e) {
        console.error('Erro ao buscar estrutura da tabela:', e);
    }

    console.log('\n--- RECENT LEADS ---');
    const leads = await prisma.lead.findMany({
        take: 5,
        orderBy: { criadoEm: 'desc' }
    });
    console.log(JSON.stringify(leads, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
