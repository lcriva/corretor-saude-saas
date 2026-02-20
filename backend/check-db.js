const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USERS ---');
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, nome: u.nome })), null, 2));

    console.log('\n--- LEADS CREATED TODAY (UTC) ---');
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const leads = await prisma.lead.findMany({
        where: {
            criadoEm: { gte: startOfToday }
        },
        orderBy: { criadoEm: 'desc' }
    });

    if (leads.length === 0) {
        console.log('Nenhum lead encontrado hoje.');
    } else {
        console.log(JSON.stringify(leads.map(l => ({
            id: l.id,
            nome: l.nome,
            telefone: l.telefone,
            origem: l.origem,
            status: l.status,
            userId: l.userId,
            criadoEm: l.criadoEm
        })), null, 2));
    }

    console.log('\n--- RECENT INTERACTIONS ---');
    const interacoes = await prisma.interacao.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 5,
        include: { lead: { select: { nome: true } } }
    });
    console.log(JSON.stringify(interacoes.map(i => ({
        id: i.id,
        leadNome: i.lead?.nome,
        tipo: i.tipo,
        descricao: i.descricao,
        criadoEm: i.criadoEm
    })), null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
