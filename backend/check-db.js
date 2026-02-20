const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- ALL USERS ---');
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, nome: u.nome })), null, 2));

    console.log('\n--- TARGET LEAD CHECK (6164414f-a382-48af-bc5e-23f36c129145) ---');
    const lead = await prisma.lead.findUnique({
        where: { id: '6164414f-a382-48af-bc5e-23f36c129145' }
    });

    if (lead) {
        console.log('✅ Lead encontrado:');
        console.log(JSON.stringify({
            id: lead.id,
            nome: lead.nome,
            userId: lead.userId,
            origem: lead.origem,
            criadoEm: lead.criadoEm
        }, null, 2));
    } else {
        console.log('❌ Lead NÃO encontrado no banco!');
    }

    console.log('\n--- RECENT LEADS (Any User) ---');
    const recentLeads = await prisma.lead.findMany({
        take: 3,
        orderBy: { criadoEm: 'desc' },
        include: { user: { select: { email: true, nome: true } } }
    });
    console.log(JSON.stringify(recentLeads.map(l => ({
        id: l.id,
        nome: l.nome,
        atribuidoA: `${l.user?.nome} (${l.user?.email})`,
        userId: l.userId,
        criadoEm: l.criadoEm
    })), null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
