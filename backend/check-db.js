const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany();
    console.log(users.map(u => ({ id: u.id, email: u.email, nome: u.nome })));

    console.log('\n--- ALL LEADS (Last 20) ---');
    const leads = await prisma.lead.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 20
    });
    console.log(leads.map(l => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        origem: l.origem,
        status: l.status,
        userId: l.userId,
        criadoEm: l.criadoEm,
        msgCount: 0 // placeholder
    })));

    for (const lead of leads) {
        const count = await prisma.interacao.count({ where: { leadId: lead.id } });
        console.log(`Lead ${lead.id} (${lead.nome}): ${count} interações`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
