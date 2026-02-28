
'use client';

import { Phone, Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const phoneNumber = "(11) 96760-9811";
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const sendMessage = () => {
        const msg = "Olá! Gostaria de uma cotação do Prevent Senior.";
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const sendRedeMessage = () => {
        const msg = "Olá! Gostaria de consultar a rede credenciada Prevent Senior.";
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <header className="bg-white py-4 fixed w-full top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-20">
                {/* Brand / Logo */}
                <div className="flex items-center">
                    <a href="/">
                        <img
                            src="https://prevent.tradecorretora.com.br/wp-content/smush-avif/Logo-Corretora-autorizada-Prevent-Senior-logo-prevent-768x146.png.avif"
                            alt="Prevent Senior"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                    </a>
                </div>

                {/* Nav Desktop */}
                <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-[#4a4a4a] uppercase tracking-wide">
                    <a href="#prevent" className="hover:text-[#007aff] transition-colors duration-300">Sobre</a>
                    <a href="#planos" className="hover:text-[#007aff] transition-colors duration-300">Planos</a>
                    <button onClick={sendRedeMessage} className="hover:text-[#007aff] transition-colors duration-300">REDE CREDENCIADA</button>
                    <a href="#diferenciais" className="hover:text-[#007aff] transition-colors duration-300">Diferenciais</a>

                    <button
                        onClick={sendMessage}
                        className="bg-[#25D366] hover:bg-[#20ba5c] text-white px-7 py-3 rounded-full font-bold transition-all shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] flex items-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Falar no WhatsApp
                    </button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu className="w-8 h-8" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-full shadow-lg p-4 flex flex-col gap-4">
                    <a href="#prevent" className="block py-2 text-[#4a4a4a] font-semibold hover:text-[#007aff]">Sobre</a>
                    <a href="#planos" className="block py-2 text-[#4a4a4a] font-semibold hover:text-[#007aff]">Planos</a>
                    <button onClick={sendRedeMessage} className="block w-full text-left py-2 text-[#4a4a4a] font-semibold hover:text-[#007aff]">REDE CREDENCIADA</button>
                    <a href="#diferenciais" className="block py-2 text-[#4a4a4a] font-semibold hover:text-[#007aff]">Diferenciais</a>
                    <button
                        onClick={sendMessage}
                        className="w-full bg-[#25D366] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Falar no WhatsApp
                    </button>
                </div>
            )}
        </header>
    );
}
