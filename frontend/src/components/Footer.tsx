
'use client';

import { Mail, Phone } from 'lucide-react';

export function Footer() {
    return (
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
                        <li><a href="/quem-somos" className="hover:text-[#007aff] transition-colors">Quem Somos</a></li>
                        <li><a href="/#rede" className="hover:text-[#007aff] transition-colors">Rede de Atendimento</a></li>
                        <li><a href="/#faq" className="hover:text-[#007aff] transition-colors">Dúvidas Frequentes</a></li>
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
    );
}
