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
                                name: 'Qual o preço do plano Prevent Senior em 2026?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'O plano Prevent Senior 1025 Enfermaria começa em R$ 759,84 e o Prevent MAIS Enfermaria começa em R$ 883,53 (tabela 2026). Para beneficiários de 59 anos ou mais, os valores iniciam em R$ 1.315,59. Consulte a tabela de preços oficial nesta página.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Como agendar consulta Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Os agendamentos podem ser feitos pelo aplicativo oficial Beneficiário Prevent Senior ou pelo Portal do Beneficiário no site da operadora. É possível marcar consultas, exames e cancelamentos de forma 100% digital.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Qual a taxa de cadastro do plano Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Atualmente, a taxa de inscrição ou cadastro para contratação do plano Prevent Senior está isenta (R$ 0,00). Você paga apenas a primeira mensalidade para iniciar a cobertura.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Quais hospitais atendem o plano Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'O atendimento é feito na rede própria Sancta Maggiore, com hospitais em Itaim Bibi, Mooca, Morumbi, Paraíso e Vergueiro, além de Núcleos de Medicina Avançada e laboratórios parceiros como CDB e Lavoisier.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Qual é o aplicativo da Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'O app oficial é o "Beneficiário Prevent Senior", disponível para Android e iPhone. Por ele você acessa a carteirinha digital, rede credenciada, boletos e agendamentos.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Como funciona o reembolso da Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'A Prevent Senior oferece reembolso para consultas fora da rede credenciada em determinadas categorias de plano. O pedido deve ser feito via app ou portal com o envio dos recibos médicos.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Como contratar o plano Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'A contratação pode ser feita online. Simule sua cotação nesta landing page ou fale diretamente com um corretor autorizado via WhatsApp para receber a proposta digital.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'O Prevent Senior tem reajuste por idade?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Exclusividade Prevent Senior: os planos não possuem reajuste por faixa etária a partir dos 50 anos (ou 44 anos em algumas categorias). Isso garante estabilidade financeira para a terceira idade.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Onde fica a rede credenciada Prevent Senior?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'A rede própria está concentrada em São Paulo (Capital e ABC) e Litoral (Santos). Inclui hospitais Sancta Maggiore, prontos-atendimentos e clínicas especializadas.',
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
                                <span className="text-3xl md:text-4xl font-bold">Tabela de Preços 2026</span>
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

            {/* ══ Tabela Detalhada de Valores ═══════════════════════════════════ */}
            <section id="tabela-completa" className="py-20 bg-white" aria-label="Tabela completa de preços Prevent Senior por faixa etária">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Tabela Completa 2026</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3 text-[#0f192b]">
                            Valores por Faixa Etária — Todos os Planos
                        </h2>
                        <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                            Individual · Sem coparticipação · Sem cobrança de taxa de inscrição ·
                            Área de cobertura: São Paulo, São Bernardo do Campo, Santo André e Santos ·
                            Válido a partir de Fevereiro de 2026
                        </p>
                    </div>

                    {/* Enfermaria */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-[#0f192b] mb-4 flex items-center gap-2">
                            🛏 Enfermaria (E)
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#0f192b] text-white">
                                        <th className="px-5 py-3 text-left font-bold">Faixa Etária</th>
                                        <th className="px-5 py-3 text-center font-bold">Prevent Senior 1025</th>
                                        <th className="px-5 py-3 text-center font-bold text-[#60a5fa]">Prevent MAIS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { faixa: '0 a 18 anos', ps: 'R$ 759,84', mais: 'R$ 883,53' },
                                        { faixa: '19 a 23 anos', ps: 'R$ 759,84', mais: 'R$ 883,53' },
                                        { faixa: '24 a 28 anos', ps: 'R$ 759,84', mais: 'R$ 883,53' },
                                        { faixa: '29 a 33 anos', ps: 'R$ 759,84', mais: 'R$ 883,53' },
                                        { faixa: '34 a 38 anos', ps: 'R$ 759,84', mais: 'R$ 883,53' },
                                        { faixa: '39 a 43 anos', ps: 'R$ 759,84', mais: 'R$ 883,53' },
                                        { faixa: '44 a 48 anos', ps: 'R$ 999,84', mais: 'R$ 1.162,60' },
                                        { faixa: '49 a 53 anos', ps: 'R$ 999,84', mais: 'R$ 1.162,60' },
                                        { faixa: '54 a 58 anos', ps: 'R$ 999,84', mais: 'R$ 1.162,60' },
                                        { faixa: '59 anos ou +', ps: 'R$ 1.315,59', mais: 'R$ 1.529,75' },
                                    ].map((row, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-5 py-3 font-medium text-gray-700">{row.faixa}</td>
                                            <td className="px-5 py-3 text-center font-bold text-[#0f192b]">{row.ps}<span className="text-xs text-gray-400 font-normal">/mês</span></td>
                                            <td className="px-5 py-3 text-center font-bold text-[#007aff]">{row.mais}<span className="text-xs text-gray-400 font-normal">/mês</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Apartamento */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-[#0f192b] mb-4 flex items-center gap-2">
                            🏨 Apartamento (A)
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#0f192b] text-white">
                                        <th className="px-5 py-3 text-left font-bold">Faixa Etária</th>
                                        <th className="px-5 py-3 text-center font-bold">Prevent Senior 1025</th>
                                        <th className="px-5 py-3 text-center font-bold text-[#60a5fa]">Prevent MAIS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { faixa: '0 a 18 anos', ps: 'R$ 907,73', mais: 'R$ 1.055,50' },
                                        { faixa: '19 a 23 anos', ps: 'R$ 907,73', mais: 'R$ 1.055,50' },
                                        { faixa: '24 a 28 anos', ps: 'R$ 907,73', mais: 'R$ 1.055,50' },
                                        { faixa: '29 a 33 anos', ps: 'R$ 907,73', mais: 'R$ 1.055,50' },
                                        { faixa: '34 a 38 anos', ps: 'R$ 907,73', mais: 'R$ 1.055,50' },
                                        { faixa: '39 a 43 anos', ps: 'R$ 907,73', mais: 'R$ 1.055,50' },
                                        { faixa: '44 a 48 anos', ps: 'R$ 1.195,06', mais: 'R$ 1.389,60' },
                                        { faixa: '49 a 53 anos', ps: 'R$ 1.195,06', mais: 'R$ 1.389,60' },
                                        { faixa: '54 a 58 anos', ps: 'R$ 1.195,06', mais: 'R$ 1.389,60' },
                                        { faixa: '59 anos ou +', ps: 'R$ 1.572,45', mais: 'R$ 1.828,43' },
                                    ].map((row, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-5 py-3 font-medium text-gray-700">{row.faixa}</td>
                                            <td className="px-5 py-3 text-center font-bold text-[#0f192b]">{row.ps}<span className="text-xs text-gray-400 font-normal">/mês</span></td>
                                            <td className="px-5 py-3 text-center font-bold text-[#007aff]">{row.mais}<span className="text-xs text-gray-400 font-normal">/mês</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Diferença entre planos */}
                    <div className="bg-[#f8faff] rounded-2xl border border-[#007aff]/20 p-6">
                        <h3 className="font-bold text-[#0f192b] mb-3">Qual a diferença entre os planos?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            O <strong>Prevent Senior 1025</strong> é focado em São Paulo e oferece plano individual sem reajuste por idade a partir dos 44 anos, com modelo de hospitais temáticos Sancta Maggiore.
                            Já o <strong>Prevent MAIS</strong> tem cobertura ampliada (SP e Rio de Janeiro), sem reajuste por faixa etária a partir dos 44 anos, rede credenciada expandida e vantagens na portabilidade de carências.
                            Ambos são <strong>sem coparticipação</strong> e focados no público sênior.
                        </p>
                        <p className="text-gray-500 text-xs mt-3">
                            Taxa de inscrição: <strong className="text-green-600">Isenta</strong> · Segmentação: Ambulatorial e Hospitalar SEM Obstetrícia · Individual
                        </p>
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
                                a: 'O Prevent Senior 1025 começa em R$ 759,84/mês (Enfermaria, até 43 anos) e o Prevent MAIS começa em R$ 883,53/mês. Para 44–58 anos, os valores são R$ 999,84 (1025 Enf) e R$ 1.162,60 (MAIS Enf). Para 59 anos ou mais: R$ 1.315,59 (1025 Enf) e R$ 1.529,75 (MAIS Enf). Veja a tabela completa na seção de planos.',
                            },
                            {
                                q: 'Como agendar consulta Prevent Senior?',
                                a: 'Os agendamentos de consultas podem ser realizados pelo Portal do Beneficiário Prevent Senior ou pelo aplicativo Beneficiário Prevent Senior, disponível na Play Store (Android) ou App Store (iOS).',
                            },
                            {
                                q: 'Qual a taxa de cadastro do plano Prevent Senior?',
                                a: 'A taxa de inscrição (cadastro) do plano Prevent Senior está isenta. Não há cobrança de taxa de cadastro por contrato.',
                            },
                            {
                                q: 'Quais hospitais atendem o plano Prevent Senior?',
                                a: 'Os beneficiários têm acesso à rede própria Sancta Maggiore (mais de 15 unidades em SP e Litoral), Núcleos de Medicina Avançada Prevent Senior, Núcleos de Reabilitação, Hospital Jardins, além de laboratórios parceiros como Laboratório A+, CDB e Lavoisier.',
                            },
                            {
                                q: 'Qual é o aplicativo da Prevent Senior?',
                                a: 'O app oficial da Prevent Senior está disponível para Android e iOS. Por ele você acessa: carteirinha virtual, agendamento de consultas, cancelamentos, rede credenciada, solicitação de segunda via de boleto, envio de documentos médicos e o canal "Fale Conosco".',
                            },
                            {
                                q: 'Como funciona o reembolso da Prevent Senior?',
                                a: 'A operadora disponibiliza reembolso para consultas realizadas fora da rede credenciada e para alguns procedimentos, conforme a categoria do plano contratado. O pedido é feito diretamente pelo beneficiário no portal ou app da Prevent Senior.',
                            },
                            {
                                q: 'Como contratar o plano Prevent Senior?',
                                a: 'Simule sua cotação diretamente nesta página ou entre em contato pelo WhatsApp. Um especialista entra em contato em até 24 horas para fechar a proposta com as melhores condições.',
                            },
                            {
                                q: 'O Prevent Senior tem reajuste por idade?',
                                a: 'Não. A partir dos 44 anos, os planos Prevent Senior 1025 e Prevent MAIS não aplicam reajuste por faixa etária. Isso é uma grande vantagem em relação a outras operadoras, que podem aumentar o plano em até 300% ao longo da vida.',
                            },
                            {
                                q: 'Onde fica a rede credenciada Prevent Senior?',
                                a: 'A rede própria Sancta Maggiore cobre São Paulo Capital, ABC Paulista (Santo André, São Bernardo do Campo) e Litoral (Santos). Hospitais, Prontos Atendimentos e Núcleos de Medicina Avançada. Confira a página de Rede Credenciada para a lista completa.',
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