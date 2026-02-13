import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await prisma.interacao.deleteMany();
    await prisma.proposta.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.plano.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuário de teste
    const senhaHash = await bcrypt.hash('123456', 10);

    const user = await prisma.user.create({
        data: {
            email: 'demo@corretor.com',
            senha: senhaHash,
            nome: 'João Corretor Demo',
            telefone: '(11) 98765-4321',
            plano: 'pro'
        }
    });

    console.log('✅ Usuário criado:', user.email);

    // Criar leads de exemplo
    const leads = await Promise.all([
        prisma.lead.create({
            data: {
                nome: 'Maria Silva',
                telefone: '(11) 98765-1234',
                email: 'maria@email.com',
                idade: 35,
                cidade: 'São Paulo',
                estado: 'SP',
                dependentes: 2,
                status: 'novo',
                origem: 'whatsapp',
                valorEstimado: 1200,
                scoreIA: 87,
                userId: user.id
            }
        }),
        prisma.lead.create({
            data: {
                nome: 'João Santos',
                telefone: '(21) 97654-3210',
                email: 'joao@email.com',
                idade: 42,
                cidade: 'Rio de Janeiro',
                estado: 'RJ',
                dependentes: 0,
                status: 'proposta',
                origem: 'whatsapp',
                valorEstimado: 650,
                scoreIA: 65,
                userId: user.id
            }
        }),
        prisma.lead.create({
            data: {
                nome: 'Ana Costa',
                telefone: '(31) 96543-2109',
                email: 'ana@email.com',
                idade: 28,
                cidade: 'Belo Horizonte',
                estado: 'MG',
                dependentes: 1,
                status: 'negociacao',
                origem: 'indicacao',
                valorEstimado: 890,
                scoreIA: 72,
                userId: user.id
            }
        }),
        prisma.lead.create({
            data: {
                nome: 'Pedro Lima',
                telefone: '(41) 95432-1098',
                email: 'pedro@email.com',
                idade: 55,
                cidade: 'Curitiba',
                estado: 'PR',
                dependentes: 3,
                status: 'fechado',
                origem: 'whatsapp',
                valorEstimado: 1850,
                scoreIA: 91,
                userId: user.id
            }
        })
    ]);

    console.log(`✅ ${leads.length} leads criados`);

    // Criar interações
    await prisma.interacao.createMany({
        data: [
            {
                tipo: 'whatsapp',
                descricao: 'Lead captado via WhatsApp Bot',
                leadId: leads[0].id
            },
            {
                tipo: 'chamada',
                descricao: 'Primeira ligação realizada - cliente interessado',
                leadId: leads[0].id
            },
            {
                tipo: 'proposta',
                descricao: 'Proposta Bradesco TOP Nacional enviada',
                leadId: leads[1].id
            },
            {
                tipo: 'venda',
                descricao: 'Venda fechada! SulAmérica Clássico',
                leadId: leads[3].id
            }
        ]
    });

    console.log('✅ Interações criadas');

    // Criar propostas
    await prisma.proposta.createMany({
        data: [
            {
                operadora: 'Bradesco Saúde',
                plano: 'TOP Nacional',
                valor: 1187,
                cobertura: 'Cobertura nacional completa',
                enviada: false,
                leadId: leads[0].id,
                userId: user.id
            },
            {
                operadora: 'Amil',
                plano: 'One S750',
                valor: 1094,
                cobertura: 'Hospital Albert Einstein incluído',
                enviada: false,
                leadId: leads[0].id,
                userId: user.id
            },
            {
                operadora: 'SulAmérica',
                plano: 'Clássico',
                valor: 1850,
                cobertura: 'Reembolso até 90%',
                enviada: true,
                aceita: true,
                leadId: leads[3].id,
                userId: user.id
            }
        ]
    });

    console.log('✅ Propostas criadas');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📧 Login de teste:');
    console.log('   Email: demo@corretor.com');
    console.log('   Senha: 123456');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });