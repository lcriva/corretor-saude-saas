// Server Component — sem 'use client' para máximo SEO
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';
import { MapPin, Phone, Building2, Stethoscope, Activity, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rede Credenciada Prevent Senior | Hospitais Sancta Maggiore em SP e RJ',
    description:
        'Conheça a rede credenciada Prevent Senior: Hospitais e Prontos Atendimentos Sancta Maggiore em São Paulo, Interior e Litoral. Rede própria com mais de 15 unidades.',
    alternates: { canonical: '/rede-credenciada' },
    openGraph: {
        title: 'Rede Credenciada Prevent Senior | Sancta Maggiore',
        description: 'Hospitais e Prontos Atendimentos Sancta Maggiore. Rede própria Prevent Senior em SP e RJ.',
        url: 'https://preventseniormelhoridade.com.br/rede-credenciada',
    },
};

// ─── DADOS DA REDE ──────────────────────────────────────────────────────────

const categorias = [
    {
        label: 'Orientador Médico',
        cor: '#10b981',
        icone: '🩺',
        desc: 'Médico exclusivo Prevent Senior — acompanhe sua saúde com um profissional dedicado.',
        unidades: [
            {
                nome: 'Orientador Médico Prevent Senior',
                bairro: 'Disponível em todas as unidades',
                telefones: [],
                servicos: ['Acompanhamento personalizado de saúde', 'Coordenação de cuidados', 'Prevenção e monitoramento contínuo'],
            },
        ],
    },
    {
        label: 'Hospitais e Prontos Atendimentos — São Paulo Capital',
        cor: '#007aff',
        icone: '🏥',
        desc: 'Unidades hospitalares e prontos atendimentos na cidade de São Paulo.',
        unidades: [
            {
                nome: 'Hospital Sancta Maggiore Alto da Mooca',
                bairro: 'Alto da Mooca',
                telefones: ['Geral: (11) 4085-9910', 'Tomografia: (11) 3003-2442'],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Ultrassonografia', 'Internação Clínica', 'Pronto Atendimento / Pronto Socorro'],
            },
            {
                nome: 'Hospital Sancta Maggiore Itaim',
                bairro: 'Itaim Bibi',
                telefones: [],
                servicos: ['Angiotomografia', 'Eletroencefalograma', 'Tomografia Computadorizada', 'Cirurgia Eletiva', 'Internação Clínica', 'Internação Cirúrgica', 'Hemodinâmica'],
            },
            {
                nome: 'Hospital Sancta Maggiore Liberdade',
                bairro: 'Liberdade',
                telefones: ['Nefrologia: (11) 3003-2442'],
                servicos: ['Gastroenterologia', 'Nefrologia', 'Angioplastia Coronária', 'Angiotomografia', 'Tomografia Computadorizada', 'Hemodiálise'],
            },
            {
                nome: 'Hospital Sancta Maggiore Pinheiros',
                bairro: 'Pinheiros',
                telefones: [],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Internação Clínica'],
            },
            {
                nome: 'Hospital Sancta Maggiore Mooca',
                bairro: 'Mooca',
                telefones: ['Geral: (11) 4085-9810', 'Tomografia: (11) 3003-2442'],
                servicos: ['Angiotomografia', 'Broncoscopia', 'Colonoscopia', 'Endoscopia Digestiva Alta', 'Laringoscopia', 'Tomografia Computadorizada', 'Internação Clínica', 'Ecoendoscopia', 'Biópsia de Próstata'],
            },
            {
                nome: 'Hospital Sancta Maggiore Paraíso',
                bairro: 'Paraíso',
                telefones: ['Geral: (11) 4085-9410', 'Tomografia: (11) 3003-2442'],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Ultrassonografia', 'Internação Clínica', 'Pronto Atendimento / Pronto Socorro'],
            },
            {
                nome: 'Hospital Sancta Maggiore Santa Cecília',
                bairro: 'Santa Cecília',
                telefones: ['Geral: (11) 4085-3335', 'Tomografia: (11) 3003-2442'],
                servicos: ['Angiotomografia Coronariana', 'Ecodopplercardiograma', 'Histeroscopia Diagnóstica', 'Tomografia Computadorizada', 'Cirurgia Eletiva', 'Internação Clínica', 'Internação Cirúrgica'],
            },
            {
                nome: 'Hospital Sancta Maggiore Dubai',
                bairro: 'Morumbi',
                telefones: ['Geral: (11) 4085-9380', 'Ressonância: (11) 3003-2442', 'Tomografia: (11) 4085-9380'],
                servicos: ['Angiorressonância', 'Ressonância Magnética', 'Colangiopancreatografia (CPRE)', 'Tomografia Computadorizada', 'Internação Clínica', 'Internação Cirúrgica', 'Ressonância Magnética com Sedação'],
            },
            {
                nome: 'Hospital Sancta Maggiore Paris',
                bairro: 'São Paulo',
                telefones: [],
                servicos: ['Tomografia Computadorizada'],
            },
            {
                nome: 'Hospital e Pronto Atendimento Sancta Maggiore Rússia',
                bairro: 'São Paulo',
                telefones: [],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Internação Clínica'],
            },
        ],
    },
    {
        label: 'Prontos Atendimentos — São Paulo Capital',
        cor: '#f59e0b',
        icone: '🚑',
        desc: 'Unidades de pronto atendimento para urgências.',
        unidades: [
            {
                nome: 'Pronto Atendimento Sancta Maggiore Butantã',
                bairro: 'Butantã',
                telefones: [],
                servicos: ['Pronto Atendimento / Pronto Socorro Ortopédico', 'Pronto Atendimento / Pronto Socorro'],
            },
            {
                nome: 'Pronto Atendimento Sancta Maggiore Jardim Paulista',
                bairro: 'Jardim Paulista',
                telefones: [],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Pronto Atendimento / Pronto Socorro'],
            },
            {
                nome: 'Pronto Atendimento Sancta Maggiore Tatuapé',
                bairro: 'Tatuapé',
                telefones: ['Geral: (11) 4085-3350', 'Tomografia: (11) 3003-2442'],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Pronto Atendimento / Pronto Socorro'],
            },
            {
                nome: 'Pronto Atendimento Sancta Maggiore Santana',
                bairro: 'Santana',
                telefones: [],
                servicos: ['Angiotomografia', 'Tomografia Computadorizada', 'Pronto Atendimento / Pronto Socorro Ortopédico', 'Pronto Atendimento / Pronto Socorro'],
            },
        ],
    },
    {
        label: 'Núcleos de Medicina Avançada — Interior e Litoral',
        cor: '#8b5cf6',
        icone: '🔬',
        desc: 'Unidades avançadas com especialidades e exames diagnósticos no ABC e Litoral.',
        unidades: [
            {
                nome: 'Núcleo de Medicina Avançada e Diagnóstica — Santo André',
                bairro: 'Santo André / ABC',
                telefones: [],
                servicos: ['Cardiologia', 'Cirurgia Geral', 'Cirurgia Vascular', 'Endocrinologia', 'Gastroenterologia', 'Geriatria', 'Neurologia', 'Ortopedia e Traumatologia', 'Densitometria Óssea', 'Ecodopplercardiograma', 'Mamografia', 'Ultrassonografia', 'Raios X'],
            },
            {
                nome: 'Núcleo de Medicina Avançada — Santos (JT)',
                bairro: 'Santos / Litoral',
                telefones: [],
                servicos: ['Cardiologia', 'Cirurgia Cardiovascular', 'Cirurgia Oncológica', 'Cirurgia Plástica Reparadora', 'Oncologia', 'Ortopedia e Traumatologia', 'Pneumologia', 'Psiquiatria', 'Urologia', 'Obstetrícia', 'Pediatria', 'Quimioterapia Adulto'],
            },
        ],
    },
];

const stats = [
    { valor: '15+', label: 'Unidades próprias' },
    { valor: '100%', label: 'Rede Sancta Maggiore' },
    { valor: '24h', label: 'Prontos atendimentos' },
    { valor: 'SP e Litoral', label: 'Cobertura' },
];

export default function RedeCredenciadaPage() {
    return (
        <>
            <Header />
            <main>
                {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
                <section
                    className="relative bg-[#0f192b] text-white pt-32 pb-20 overflow-hidden"
                    aria-label="Rede Credenciada Prevent Senior"
                >
                    {/* Gradient glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#007aff]/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#007aff]/10 rounded-full blur-2xl" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                        <span className="inline-block bg-[#007aff]/20 text-[#007aff] font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-full mb-6">
                            Rede Própria Sancta Maggiore
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6">
                            Rede Credenciada{' '}
                            <span className="text-[#007aff]">Prevent Senior</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
                            Hospitais, Prontos Atendimentos e Núcleos de Medicina Avançada da rede própria Sancta Maggiore.
                            Atendimento especializado para o Adulto+ em São Paulo e região.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <div className="text-2xl font-black text-[#007aff]">{s.valor}</div>
                                    <div className="text-xs text-gray-300 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ REDE POR CATEGORIA ════════════════════════════════════════════════ */}
                <section className="py-20 bg-gray-50" aria-label="Lista da rede credenciada Prevent Senior">
                    <div className="container mx-auto px-4 max-w-6xl">

                        {categorias.map((cat, ci) => (
                            <div key={ci} className="mb-20">
                                {/* Cabeçalho da categoria */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md"
                                        style={{ background: `${cat.cor}20`, border: `1px solid ${cat.cor}40` }}
                                    >
                                        {cat.icone}
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-[#0f192b]">{cat.label}</h2>
                                        <p className="text-gray-500 text-sm">{cat.desc}</p>
                                    </div>
                                </div>

                                <div
                                    className="h-1 w-20 rounded-full mb-10"
                                    style={{ background: cat.cor }}
                                />

                                {/* Cards das unidades */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {cat.unidades.map((u, ui) => (
                                        <div
                                            key={ui}
                                            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col"
                                        >
                                            {/* Topo colorido */}
                                            <div
                                                className="h-1.5 w-full"
                                                style={{ background: cat.cor }}
                                            />
                                            <div className="p-6 flex flex-col flex-1">
                                                {/* Nome e bairro */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    <Building2
                                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                                        style={{ color: cat.cor }}
                                                    />
                                                    <div>
                                                        <h3 className="font-bold text-[#0f192b] leading-snug text-sm">{u.nome}</h3>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {u.bairro}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Serviços */}
                                                {u.servicos.length > 0 && (
                                                    <div className="mb-4 flex-1">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                            <Stethoscope className="w-3 h-3" /> Serviços disponíveis
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {u.servicos.slice(0, 6).map((s, si) => (
                                                                <li key={si} className="flex items-start gap-1.5 text-xs text-gray-600">
                                                                    <ChevronRight
                                                                        className="w-3 h-3 mt-0.5 flex-shrink-0"
                                                                        style={{ color: cat.cor }}
                                                                    />
                                                                    {s}
                                                                </li>
                                                            ))}
                                                            {u.servicos.length > 6 && (
                                                                <li className="text-xs text-gray-400 pl-4">
                                                                    +{u.servicos.length - 6} serviços
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Telefones */}
                                                {u.telefones.length > 0 && (
                                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> Contato
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {u.telefones.map((t, ti) => (
                                                                <li key={ti} className="text-xs text-gray-600 font-medium">{t}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ CTA FINAL ════════════════════════════════════════════════════════ */}
                <section className="py-20 bg-[#0f192b]" aria-label="Contratar plano Prevent Senior">
                    <div className="container mx-auto px-4 max-w-3xl text-center">
                        <span className="inline-block bg-[#007aff]/20 text-[#007aff] font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-full mb-6">
                            Faça sua Cotação
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                            Acesse toda essa rede com o{' '}
                            <span className="text-[#007aff]">plano certo para você</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-10">
                            Compare os planos Prevent Senior 1025 e Prevent MAIS, escolha entre Enfermaria e Apartamento
                            e tenha acesso imediato à rede Sancta Maggiore.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/#planos"
                                className="inline-flex items-center justify-center gap-2 bg-[#007aff] text-white font-bold px-8 py-4 rounded-full hover:bg-[#0060df] transition-colors duration-200 text-lg"
                            >
                                Ver tabela de preços
                            </a>
                            <a
                                href="https://wa.me/5511967609811?text=Oi%2C%20quero%20um%20plano%20de%20sa%C3%BAde"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1da851] transition-colors duration-200 text-lg"
                            >
                                💬 Cotação pelo WhatsApp
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <ChatWidget />
        </>
    );
}
