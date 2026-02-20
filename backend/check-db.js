const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany();
    console.log(users.map(u => ({ id: u.id, email: u.email, nome: u.nome })));

    console.log('\n--- RECENT LEADS ---');
    const leads = await prisma.lead.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 10
    });
    console.log(leads.map(l => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        origem: l.origem,
        status: l.status,
        userId: l.userId,
        criadoEm: l.criadoEm
    })));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
