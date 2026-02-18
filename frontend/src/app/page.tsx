'use client';

import { Phone, CheckCircle, MapPin, Building, ShieldCheck, Mail, Menu, MessageCircle } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

export default function PreventLandingPage() {
    const phoneNumber = "(11) 96760-9811";
    const companyName = "Acesso Company Seguros";

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

    const sendMessage = () => {
        const msg = "Olá! Gostaria de uma cotação do Prevent Senior.";
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const openChat = () => {
        window.dispatchEvent(new Event('open-chat'));
    };

    return (
        <div className="min-h-screen font-sans text-[#333]">
            {/* Header */}
            <header className="bg-white py-4 fixed w-full top-0 z-50 shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-20">
                    {/* Brand / Logo */}
                    <div className="flex items-center">
                        <img
                            src="https://prevent.tradecorretora.com.br/wp-content/smush-avif/Logo-Corretora-autorizada-Prevent-Senior-logo-prevent-768x146.png.avif"
                            alt="Prevent Senior"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                    </div>

                    {/* Nav Desktop */}
                    <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-[#4a4a4a] uppercase tracking-wide">
                        <a href="#diferenciais" className="hover:text-[#007aff] transition-colors duration-300">Diferenciais</a>
                        <a href="#rede" className="hover:text-[#007aff] transition-colors duration-300">Rede Própria</a>
                        <a href="#planos" className="hover:text-[#007aff] transition-colors duration-300">Tabela de Preços</a>

                        <button
                            onClick={sendMessage}
                            className="bg-[#007aff] hover:bg-[#0062cc] text-white px-7 py-3 rounded-full font-bold transition-all shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)] flex items-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            {phoneNumber}
                        </button>
                    </nav>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-gray-700">
                        <Menu className="w-8 h-8" />
                    </button>
                </div>
            </header>

            {/* Hero Section */}
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
                                WhatsApp
                            </button>
                            <button
                                onClick={openChat}
                                className="bg-[#007aff] hover:bg-[#0062cc] text-white font-bold py-4 px-8 rounded-full shadow-[0_4px_14px_rgba(0,122,255,0.4)] transition-all hover:-translate-y-1 uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Cotação Online
                            </button>
                        </div>

                        <div className="mt-10 flex items-center gap-4 text-sm text-gray-200">
                            <ShieldCheck className="w-8 h-8 text-[#007aff]" />
                            <span>Sem reajuste por faixa etária a partir dos 50 anos.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Diferenciais Section */}
            <section id="diferenciais" className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-[#007aff] font-bold uppercase tracking-widest text-xs">Por que escolher?</span>
                        <h2 className="text-3xl md:text-4xl font-black text-[#0f192b] mt-2 mb-4">Diferenciais que Inspiram Confiança</h2>
                        <div className="w-20 h-1 bg-[#007aff] mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Card 1 */}
                        <div className="group bg-[#f9f9f9] p-8 rounded-3xl transition-all hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 text-center">
                            <div className="w-16 h-16 mx-auto bg-white shadow-lg rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Building className="w-8 h-8 text-[#007aff]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f192b] mb-3">Rede Própria Exclusiva</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Acesso aos hospitais Sancta Maggiore e Núcleos de Medicina Avançada Prevent Senior.
                            </p>
                        </div>
                        {/* Card 2 */}
                        <div className="group bg-[#f9f9f9] p-8 rounded-3xl transition-all hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 text-center">
                            <div className="w-16 h-16 mx-auto bg-white shadow-lg rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-8 h-8 text-[#007aff]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f192b] mb-3">Sem Carência*</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Condições especiais para quem já possui plano de saúde anterior. Consulte regras.
                            </p>
                        </div>
                        {/* Card 3 */}
                        <div className="group bg-[#f9f9f9] p-8 rounded-3xl transition-all hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 text-center">
                            <div className="w-16 h-16 mx-auto bg-white shadow-lg rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-8 h-8 text-[#007aff]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0f192b] mb-3">Cobertura Internacional</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Filiais em Dubai, Paris e Madrid para atendimento e acolhimento.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="planos" className="py-24 bg-[#f4f7f6]">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <span className="bg-[#007aff]/10 text-[#007aff] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Tabela 2024</span>
                        <h2 className="text-3xl md:text-5xl font-black text-[#0f192b] mt-4">Nossos Planos</h2>
                        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                            Confira os valores para o plano <strong>Prevent Senior 1000</strong> (Rede Própria).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Enfermaria Card */}
                        <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative border border-gray-100">
                            <div className="p-8 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold text-[#0f192b]">Enfermaria</h3>
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">BÁSICO</span>
                                </div>
                                <p className="text-gray-500 text-sm">Acomodação coletiva com todo conforto e qualidade da rede.</p>
                            </div>
                            <div className="p-8 bg-gray-50/50">
                                <ul className="space-y-4">
                                    {precosEnfermaria.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-gray-600 font-semibold text-sm">{item.faixa}</span>
                                            <span className="text-lg font-bold text-[#0f192b]">{item.valor}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={sendMessage}
                                    className="w-full mt-8 bg-[#0f192b] hover:bg-black text-white py-4 rounded-xl font-bold transition-all transform active:scale-95"
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

            {/* Footer */}
            <footer className="bg-[#0f192b] text-white py-16 border-t border-gray-800">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-[#007aff] rounded flex items-center justify-center text-white font-bold">P</div>
                            <span className="font-bold text-xl">PREVENTSENIOR</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                            A primeira operadora de saúde voltada para o Adulto+! Pioneira em medicina especializada e na valorização da qualidade de vida.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#007aff] transition-colors cursor-pointer"><Mail className="w-4 h-4" /></div>
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#007aff] transition-colors cursor-pointer"><Phone className="w-4 h-4" /></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-lg">Links Rápidos</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-[#007aff] transition-colors">Quem Somos</a></li>
                            <li><a href="#" className="hover:text-[#007aff] transition-colors">Rede de Atendimento</a></li>
                            <li><a href="#" className="hover:text-[#007aff] transition-colors">Dúvidas Frequentes</a></li>
                            <li><a href="#" className="hover:text-[#007aff] transition-colors">Portal do Beneficiário</a></li>
                        </ul>
                    </div>


                </div>
                <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Política de Privacidade</a>
                        <a href="#" className="hover:text-white">Termos de Uso</a>
                    </div>
                </div>
            </footer>

            <ChatWidget />
        </div >
    );
}