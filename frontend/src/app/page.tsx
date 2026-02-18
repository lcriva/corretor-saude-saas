'use client';

import { Phone, CheckCircle, MapPin, Building, ShieldCheck, Mail, Menu, MessageCircle, Users, HeartPulse, Clock, Smartphone, Video } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PreventLandingPage() {
    // Dados exatos capturados do site
    const precosEnfermaria = [
        { faixa: "Até 43 anos", valor: "R$ 883,53" },
        { faixa: "44 a 58 anos", valor: "R$ 1.162,60" },
        { faixa: "59 anos em diante", valor: "R$ 1.529,75" }
    ];

    const precosApartamento = [
        { faixa: "Até 43 anos", valor: "R$ 1.055,50" },
        { faixa: "44 a 58 anos", valor: "R$ 1.389,60" },
        { faixa: "59 anos em diante", valor: "R$ 1.828,43" }
    ];

    const hospitais = [
        {
            nome: "Hospital Sancta Maggiore Itaim",
            img: "https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-itaim-fachada-2-1-scaled-2-683x1024.jpg",
            local: "Itaim Bibi"
        },
        {
            nome: "Hospital Sancta Maggiore Napole",
            img: "https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-altodamooca-fachada-2-1-1-682x1024.jpg",
            local: "Alto da Mooca"
        },
        {
            nome: "Hospital Sancta Maggiore Dubai",
            img: "https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-dubai-imagem-2-1-1-1024x683.jpg",
            local: "Morumbi"
        },
        {
            nome: "Hospital Sancta Maggiore Roma",
            img: "https://www.planospreventsaude.com.br/senior/wp-content/uploads/2024/11/hsm-mooca-fachada-1-1-1-1-1024x683.jpg",
            local: "Mooca"
        },
        {
            nome: "Hospital Sancta Maggiore Sidney",
            img: "https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/hsm-paraiso-fachada-1-1-1-1024x683.jpg",
            local: "Paraíso"
        },
        {
            nome: "Hospital Sancta Maggiore Vergueiro",
            img: "https://www.planospreventsaude.com.br/senior/wp-content/uploads/2025/01/HAOC.webp",
            local: "Vergueiro"
        }
    ];

    const stats = [
        { label: "Beneficiários", value: "+ 550 mil", icon: Users },
        { label: "Colaboradores", value: "+ 14 mil", icon: Building },
        { label: "Unidades Próprias", value: "+ 45", icon: MapPin },
        { label: "Experiência", value: "+ 25 anos", icon: Clock },
    ];

    const diferenciais = [
        {
            title: "Rede Própria",
            desc: "Consultórios, clínicas, laboratórios e hospitais disponíveis em toda região. Cobertura completa para você.",
            icon: Building
        },
        {
            title: "App Prevent Senior",
            desc: "Acesso à carteirinha digital, resultados de exames, rede de atendimento e 2ª via de boleto na palma da mão.",
            icon: Smartphone
        },
        {
            title: "Teleatendimento",
            desc: "Converse com seu médico por chamada de vídeo, com toda a comodidade e sem sair de casa.",
            icon: Video
        },
        {
            title: "Carências Reduzidas",
            desc: "Entre em contato e verifique a redução de carência promocional por liberalidade da Operadora.",
            icon: Clock
        }
    ];

    const sendMessage = () => {
        const msg = "Olá! Gostaria de uma cotação do Prevent Senior.";
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const openChat = () => {
        window.dispatchEvent(new Event('open-chat'));
    };

    return (
        <div className="min-h-screen font-sans text-[#333]">
            <Header />

            {/* Hero Section */}
            <section className="relative text-white pt-32 pb-40 px-4 md:px-8 overflow-hidden z-10">
                {/* Background Image Setup */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/prevent-hero.png"
                        alt="Idosos ativos"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay: Gradient from Navy to Transparent to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f192b] via-[#0f192b]/80 to-transparent"></div>
                </div>

                <div className="container mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full">
                    <div className="max-w-2xl">
                        <div className="inline-block border-l-4 border-[#007aff] pl-4 mb-6">
                            <p className="text-[#007aff] font-bold uppercase tracking-widest text-sm mb-1">Prevent Senior</p>
                            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] text-white">
                                Saúde com <br />
                                <span className="text-[#007aff]">Inteligência e Afeto.</span>
                            </h1>
                        </div>
                        <p className="text-lg text-gray-200 mb-8 max-w-lg leading-relaxed font-light drop-shadow-md">
                            A operadora especialista no Adulto+. Prevenção e excelência médica com calma, conforto e confiança.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={sendMessage}
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-1 uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                            >
                                <Phone className="w-4 h-4" />
                                Falar no WhatsApp
                            </button>
                            <button
                                onClick={openChat}
                                className="bg-white/10 hover:bg-white/20 hover:backdrop-blur-md backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full border border-white/20 transition-all hover:-translate-y-1 uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Atendimento Online
                            </button>
                        </div>

                        <div className="mt-10 flex items-center gap-4 text-sm text-gray-200">
                            <ShieldCheck className="w-8 h-8 text-[#007aff]" />
                            <span>Sem reajuste por faixa etária a partir dos 50 anos.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quem Somos / Stats Section */}
            <section id="prevent" className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Quem Somos</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">MAIS SOBRE A PREVENT</h2>
                        <h3 className="text-xl text-gray-500 font-light">Primeiro e único plano de saúde pensado para o Adulto+.</h3>
                        <div className="w-20 h-1 bg-[#007aff] mx-auto rounded-full mt-6"></div>
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

            {/* Rede Section */}
            <section id="rede" className="py-24 bg-[#0f192b] text-white relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#007aff]/10 skew-x-12 transform translate-x-20"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Estrutura Completa</span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 leading-tight">Rede Própria</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Apenas algumas das unidades da rede Sancta Maggiore, referência em hotelaria e tecnologia hospitalar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hospitais.map((hospital, i) => (
                            <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-xl">
                                <img
                                    src={hospital.img}
                                    alt={hospital.nome}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <span className="text-[#007aff] text-xs font-bold uppercase tracking-wider mb-2 block">{hospital.local}</span>
                                    <h3 className="text-white font-bold text-lg leading-tight">{hospital.nome}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <button
                            onClick={sendMessage}
                            className="border border-white/20 hover:bg-white hover:text-[#0f192b] text-white px-8 py-3 rounded-full font-bold transition-all"
                        >
                            Consultar Rede Completa
                        </button>
                    </div>
                </div>
            </section>

            {/* Diferenciais */}
            <section id="diferenciais" className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Vantagens</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">Benefícios Prevent Senior</h2>
                        <div className="w-20 h-1 bg-[#007aff] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {diferenciais.map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <item.icon className="w-7 h-7 text-[#007aff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#0f192b]">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tabela de Preços */}
            <section id="planos" className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-wide text-sm">Investimento</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-[#0f192b]">Valores Transparentes</h2>
                        <p className="text-gray-600">Escolha a acomodação ideal para você. Sem surpresas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Enfermaria Card */}
                        <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                            <div className="p-8 border-b border-gray-100">
                                <h3 className="text-2xl font-bold text-[#0f192b] mb-1">Enfermaria</h3>
                                <p className="text-gray-500 text-sm">Excelente custo-benefício com todo o padrão Prevent.</p>
                            </div>
                            <div className="p-8 bg-gray-50/50">
                                <ul className="space-y-4">
                                    {precosEnfermaria.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-gray-700">
                                            <span className="font-semibold text-sm">{item.faixa}</span>
                                            <span className="text-lg font-bold text-[#0f192b]">{item.valor}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="mt-8 space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Carências Reduzidas</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Rede Hospitalar Exclusiva</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Clube de benefícios Exclusivo</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Rede Própria + de 45 unidades</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={sendMessage}
                                    className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-all transform active:scale-95"
                                >
                                    Quero Enfermaria
                                </button>
                            </div>
                        </div>

                        {/* Apartamento Card */}
                        <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative border-2 border-[#007aff] transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-[#007aff] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-bl-xl">
                                Mais Popular
                            </div>
                            <div className="p-8 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold text-[#0f192b]">Apartamento</h3>
                                    <span className="bg-[#007aff]/10 text-[#007aff] text-xs font-bold px-3 py-1 rounded-full">PREMIUM</span>
                                </div>
                                <p className="text-gray-500 text-sm">Privacidade e conforto total em acomodação individual.</p>
                            </div>
                            <div className="p-8 bg-[#fffcf9]">
                                <ul className="space-y-4">
                                    {precosApartamento.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#007aff]/20 shadow-sm">
                                            <span className="text-gray-600 font-semibold text-sm">{item.faixa}</span>
                                            <span className="text-xl font-bold text-[#007aff]">{item.valor}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="mt-8 space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Carências Reduzidas</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Rede Hospitalar Exclusiva</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Clube de benefícios Exclusivo</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-[#007aff] flex-shrink-0" />
                                        <span>Rede Própria + de 45 unidades</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={sendMessage}
                                    className="w-full mt-8 bg-[#007aff] hover:bg-[#0062cc] text-white py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-[#007aff]/30"
                                >
                                    Quero Apartamento
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-xs text-gray-400 mb-2">ANS 503.736/25-1 (Enf) | ANS 503.737/25-9 (Apt)</p>
                        <p className="text-xs text-gray-400">* Valores de referência. Sujeitos a alteração.</p>
                    </div>
                </div>
            </section>

            <Footer />
            <ChatWidget />
        </div >
    );
}