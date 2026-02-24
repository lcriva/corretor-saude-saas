// Server Component — sem 'use client' para máximo SEO
import { ShieldCheck, MapPin, Building, Users, Clock, Smartphone, Video, CheckCircle } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroButtons } from '@/components/HeroButtons';
import { PlanButton, NetworkButton } from '@/components/PlanButtons';

const planos = [
    {
        nome: 'Prevent Senior 1025',
        badge: '',
        destaque: false,
        desc: 'Plano individual com excelente custo-benefício e toda a cobertura da rede Sancta Maggiore.',
        precos: [
            { faixa: 'Até 43 anos', enfermaria: 'R$ 759,84', apartamento: 'R$ 907,73' },
            { faixa: '44 a 58 anos', enfermaria: 'R$ 999,84', apartamento: 'R$ 1.195,06' },
            { faixa: '59 anos ou +', enfermaria: 'R$ 1.315,59', apartamento: 'R$ 1.572,45' },
        ],
        labelBtn: 'Contratar Prevent Senior 1025',
    },
    {
        nome: 'Prevent MAIS',
        badge: 'Mais Popular',
        destaque: true,
        desc: 'Plano premium com cobertura ampliada e todas as exclusividades da rede própria Prevent Senior.',
        precos: [
            { faixa: 'Até 43 anos', enfermaria: 'R$ 883,53', apartamento: 'R$ 1.055,50' },
            { faixa: '44 a 58 anos', enfermaria: 'R$ 1.162,60', apartamento: 'R$ 1.389,60' },
            { faixa: '59 anos ou +', enfermaria: 'R$ 1.529,75', apartamento: 'R$ 1.828,43' },
        ],
        labelBtn: 'Contratar Prevent MAIS',
    },
];

const hospitais = [
    { nome: 'Hospital Sancta Maggiore Itaim', img: 'https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-itaim-fachada-2-1-scaled-2-683x1024.jpg', local: 'Itaim Bibi' },
    { nome: 'Hospital Sancta Maggiore Napole', img: 'https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-altodamooca-fachada-2-1-1-682x1024.jpg', local: 'Alto da Mooca' },
    { nome: 'Hospital Sancta Maggiore Dubai', img: 'https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-dubai-imagem-2-1-1-1024x683.jpg', local: 'Morumbi' },
    { nome: 'Hospital Sancta Maggiore Roma', img: 'https://www.planospreventsaude.com.br/senior/wp-content/uploads/2024/11/hsm-mooca-fachada-1-1-1-1-1024x683.jpg', local: 'Mooca' },
    { nome: 'Hospital Sancta Maggiore Sidney', img: 'https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-paraiso-fachada-1-1-1-1024x683.jpg', local: 'Paraíso' },
    { nome: 'Hospital Sancta Maggiore Vergueiro', img: 'https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/HAOC.webp', local: 'Vergueiro' },
];

const stats = [
    { label: 'Beneficiários', value: '+ 550 mil', icon: Users },
    { label: 'Colaboradores', value: '+ 14 mil', icon: Building },
    { label: 'Unidades Próprias', value: '+ 45', icon: MapPin },
    { label: 'Experiência', value: '+ 25 anos', icon: Clock },
];

const diferenciais = [
    {
        title: 'Rede Própria Prevent Senior',
        desc: 'Consultórios, clínicas, laboratórios e hospitais disponíveis em SP e RJ. Cobertura completa com rede própria Sancta Maggiore.',
        icon: Building,
    },
    {
        title: 'App Prevent Senior',
        desc: 'Acesso à carteirinha digital, resultados de exames, rede de atendimento e 2ª via de boleto na palma da mão.',
        icon: Smartphone,
    },
    {
        title: 'Teleatendimento',
        desc: 'Converse com seu médico por chamada de vídeo, com toda a comodidade e sem sair de casa.',
        icon: Video,
    },
    {
        title: 'Carências Reduzidas',
        desc: 'Carências promocionais para novos beneficiários. Entre em contato e verifique a redução de carência disponível.',
        icon: Clock,
    },
];

const incluso = [
    'Carências Reduzidas',
    'Rede Hospitalar Exclusiva Sancta Maggiore',
    'Clube de Benefícios Exclusivo',
    'Rede Própria com + de 45 unidades',
];

export default function PreventLandingPage() {
    return (
        <div className="min-h-screen font-sans text-[#333]">
            {/* Schema.org JSON-LD — Produto com preços */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'Plano de Saúde Prevent Senior',
                        image: 'https://preventseniormelhoridade.com.br/images/prevent-hero.png',
                        description:
                            'Plano de saúde Prevent Senior especialista no Adulto+ (Terceira Idade). Sem reajuste por faixa etária a partir de 50 anos. Tabela de preços 2026 disponível.',
                        brand: { '@type': 'Brand', name: 'Prevent Senior' },
                        offers: {
                            '@type': 'AggregateOffer',
                            url: 'https://preventseniormelhoridade.com.br',
                            priceCurrency: 'BRL',
                            lowPrice: '883.53',
                            highPrice: '1828.43',
                            offerCount: '6',
                        },
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.8',
                            reviewCount: '1250',
                        },
                    }),
                }}
            />

            {/* FAQ Schema para rich snippets no Google */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'Qual o preço do plano Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'O plano Prevent Senior Enfermaria começa em R$ 883,53 (até 43 anos) e o plano Apartamento começa em R$ 1.055,50. Para beneficiários de 59 anos em diante, os valores são R$ 1.529,75 (Enfermaria) e R$ 1.828,43 (Apartamento). Tabela de preços 2025.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Como contratar o plano Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Para contratar o plano Prevent Senior, você pode simular sua cotação diretamente nesta página, entrar em contato pelo WhatsApp (11) 96760-9811, ou preencher o formulário de atendimento. Um especialista entra em contato em até 24 horas.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'O Prevent Senior atende em São Paulo e Rio de Janeiro?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Sim. A rede Prevent Senior possui mais de 45 unidades próprias em São Paulo e está em expansão para o Rio de Janeiro. A rede Sancta Maggiore conta com hospitais em Itaim Bibi, Mooca, Morumbi, Paraíso, Alto da Mooca e Vergueiro.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'O plano Prevent Senior tem reajuste por idade?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Não. A partir dos 50 anos, o plano Prevent Senior não aplica reajuste por faixa etária, diferente da maioria das operadoras. Isso representa uma grande economia a longo prazo para beneficiários na terceira idade.',
                                },
                            },
                        ],
                    }),
                }}
            />

            <Header />

            {/* ══ Hero ══════════════════════════════════════════════════════════ */}
            <section className="relative text-white pt-32 pb-40 px-4 md:px-8 overflow-hidden z-10" aria-label="Plano de Saúde Prevent Senior">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/prevent-hero.png"
                        alt="Casal de idosos felizes com plano de saúde Prevent Senior"
                        className="w-full h-full object-cover"
                        width={1920}
                        height={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f192b] via-[#0f192b]/80 to-transparent" />
                </div>

                <div className="container mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full">
                    <div className="max-w-2xl">
                        <div className="inline-block border-l-4 border-[#007aff] pl-4 mb-6">
                            <p className="text-[#007aff] font-bold uppercase tracking-widest text-sm mb-1">Prevent Senior — São Paulo e Rio de Janeiro</p>
                            {/* H1 com palavras-chave estratégicas */}
                            <h1 className="text-4xl md:text-5xl font-black leading-[1.1] text-white">
                                Plano de Saúde <br />
                                <span className="text-[#007aff]">Prevent Senior</span>
                                <br />
                                <span className="text-3xl md:text-4xl font-bold">Tabela de Preços 2025</span>
                            </h1>
                        </div>
                        <p className="text-lg text-gray-200 mb-8 max-w-lg leading-relaxed font-light drop-shadow-md">
                            A operadora especialista no Adulto+. Sem reajuste por faixa etária a partir dos 50 anos.
                            Contrate o plano Prevent Senior com condições exclusivas e carência reduzida.
                        </p>

                        <HeroButtons />

                        <div className="mt-10 flex items-center gap-4 text-sm text-gray-200">
                            <ShieldCheck className="w-8 h-8 text-[#007aff] flex-shrink-0" />
                            <span>Sem reajuste por faixa etária a partir dos 50 anos — exclusividade Prevent Senior.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ Quem Somos ════════════════════════════════════════════════════ */}
            <section id="prevent" className="py-24 bg-white relative overflow-hidden" aria-label="Sobre a Prevent Senior">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Quem é a Prevent Senior</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">
                            O Convênio Médico para a Terceira Idade
                        </h2>
                        <p className="text-xl text-gray-500 font-light">
                            Primeiro e único plano de saúde pensado para o Adulto+. Mais de 25 anos cuidando de quem você ama.
                        </p>
                        <div className="w-20 h-1 bg-[#007aff] mx-auto rounded-full mt-6" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 mx-auto bg-[#007aff]/10 rounded-full flex items-center justify-center mb-4 text-[#007aff]">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl md:text-4xl font-black text-[#0f192b] mb-2">{stat.value}</div>
                                <div className="text-gray-500 font-medium uppercase text-xs tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ Rede Credenciada ══════════════════════════════════════════════ */}
            <section id="rede" className="py-24 bg-[#0f192b] text-white relative" aria-label="Rede credenciada Prevent Senior">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#007aff]/10 skew-x-12 transform translate-x-20" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Rede Credenciada</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 leading-tight">
                            Hospitais Sancta Maggiore — <br className="hidden md:block" />Rede Própria Prevent Senior
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Mais de 45 unidades próprias em São Paulo. Referência em hotelaria hospitalar e tecnologia médica para a terceira idade.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitais.map((hospital, i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-xl">
                                <img
                                    src={hospital.img}
                                    alt={`${hospital.nome} — Rede Prevent Senior ${hospital.local}`}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <span className="text-[#007aff] text-xs font-bold uppercase tracking-wider mb-2 block">{hospital.local}</span>
                                    <h3 className="text-white font-bold text-lg leading-tight">{hospital.nome}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <NetworkButton />
                    </div>
                </div>
            </section>

            {/* ══ Diferenciais ══════════════════════════════════════════════════ */}
            <section id="diferenciais" className="py-24 bg-white" aria-label="Benefícios do plano Prevent Senior">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Por que contratar Prevent Senior?</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">
                            Vantagens e Benefícios do Plano Prevent Senior
                        </h2>
                        <div className="w-20 h-1 bg-[#007aff] mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {diferenciais.map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <item.icon className="w-7 h-7 text-[#007aff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#0f192b]">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ Tabela de Preços ══════════════════════════════════════════════ */}
            <section id="planos" className="py-24 bg-gray-50" aria-label="Tabela de preços Prevent Senior 2026">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Tabela de Preços 2026</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">
                            Quanto Custa o Plano Prevent Senior em 2026?
                        </h2>
                        <p className="text-gray-600">
                            Dois tipos de plano, com opções de Enfermaria e Apartamento. Sem reajuste por idade após os 50 anos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
                        {planos.map((plano, pi) => (
                            <div
                                key={pi}
                                className={`bg-white rounded-3xl shadow-xl overflow-hidden relative ${plano.destaque ? 'border-2 border-[#007aff]' : 'border border-gray-100'}`}
                            >
                                {plano.badge && (
                                    <div className="absolute top-0 right-0 bg-[#007aff] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-bl-xl">
                                        {plano.badge}
                                    </div>
                                )}
                                {/* Cabeçalho do plano */}
                                <div className="p-7 border-b border-gray-100">
                                    <h3 className="text-2xl font-bold text-[#0f192b] mb-1">{plano.nome}</h3>
                                    <p className="text-gray-500 text-sm">{plano.desc}</p>
                                </div>

                                {/* Tabela de preços: Enfermaria x Apartamento */}
                                <div className={`p-7 ${plano.destaque ? 'bg-[#fffcf9]' : 'bg-gray-50/50'}`}>
                                    {/* Cabeçalho da tabela */}
                                    <div className="grid grid-cols-3 gap-2 mb-3 px-1">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Faixa</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Enfermaria</div>
                                        <div className={`text-xs font-bold uppercase tracking-wide text-center ${plano.destaque ? 'text-[#007aff]' : 'text-gray-500'}`}>Apartamento</div>
                                    </div>

                                    <ul className="space-y-3" aria-label={`Preços ${plano.nome} por faixa etária`}>
                                        {plano.precos.map((p, i) => (
                                            <li key={i} className="grid grid-cols-3 gap-2 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <span className="text-xs font-semibold text-gray-600">{p.faixa}</span>
                                                <span className="text-sm font-bold text-[#0f192b] text-center">{p.enfermaria}<span className="text-[10px] text-gray-400 font-normal">/mês</span></span>
                                                <span className={`text-sm font-bold text-center ${plano.destaque ? 'text-[#007aff]' : 'text-[#0f192b]'}`}>{p.apartamento}<span className="text-[10px] text-gray-400 font-normal">/mês</span></span>
                                            </li>
                                        ))}
                                    </ul>

                                    <ul className="mt-7 space-y-2 mb-7">
                                        {incluso.map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4 text-[#007aff] flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <PlanButton label={plano.labelBtn} variant={plano.destaque ? 'blue' : 'dark'} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-xs text-gray-400 mb-2">ANS 503.736/25-1 (Enf) | ANS 503.737/25-9 (Apt)</p>
                        <p className="text-xs text-gray-400">* Valores de referência. Sujeitos a alteração sem aviso prévio.</p>
                    </div>

                </div>
            </section>

            {/* ══ FAQ / Perguntas Frequentes ════════════════════════════════════ */}
            <section id="faq" className="py-24 bg-white" aria-label="Perguntas frequentes sobre o Prevent Senior">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Tire Suas Dúvidas</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">
                            Perguntas Frequentes — Plano Prevent Senior
                        </h2>
                        <div className="w-20 h-1 bg-[#007aff] mx-auto rounded-full" />
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: 'Qual o preço do plano Prevent Senior em 2026?',
                                a: 'O plano Prevent Senior Enfermaria começa em R$ 883,53/mês (até 43 anos). Para 44 a 58 anos, R$ 1.162,60/mês. Para 59 anos em diante, R$ 1.529,75/mês. O Apartamento tem valores de R$ 1.055,50 a R$ 1.828,43/mês, dependendo da faixa etária.',
                            },
                            {
                                q: 'Como contratar o plano Prevent Senior?',
                                a: 'Você pode simular sua cotação diretamente nesta página ou entrar em contato pelo WhatsApp. Um especialista entra em contato em até 24 horas para fechar a proposta com as melhores condições.',
                            },
                            {
                                q: 'O Prevent Senior tem reajuste por idade?',
                                a: 'Não. A partir dos 50 anos, a Prevent Senior não aplica reajuste por faixa etária. Isso é uma grande diferença em relação a outras operadoras, que podem aumentar o plano em até 300% ao longo da vida.',
                            },
                            {
                                q: 'Onde fica a rede credenciada Prevent Senior?',
                                a: 'A rede própria Sancta Maggiore possui mais de 45 unidades em São Paulo, incluindo hospitais em Itaim Bibi, Mooca, Morumbi, Paraíso, Alto da Mooca e Vergueiro, além de clínicas, laboratórios e consultórios.',
                            },
                        ].map((item, i) => (
                            <details key={i} className="group bg-gray-50 rounded-2xl border border-gray-100 p-6 cursor-pointer">
                                <summary className="font-bold text-[#0f192b] text-lg list-none flex justify-between items-center gap-4">
                                    {item.q}
                                    <span className="text-[#007aff] text-2xl font-light flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                                </summary>
                                <p className="mt-4 text-gray-600 leading-relaxed">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
            <ChatWidget />
        </div>
    );
}