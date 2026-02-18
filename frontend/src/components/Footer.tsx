
'use client';

// ... imports removed

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
                </div>

                <div>
                    <h4 className="font-bold mb-6 text-lg">Links Rápidos</h4>
                    <ul className="space-y-3 text-gray-400 text-sm">
                        <li><a href="#prevent" className="hover:text-[#007aff] transition-colors">Quem Somos</a></li>
                        <li><a href="#rede" className="hover:text-[#007aff] transition-colors">Rede de Atendimento</a></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="/politica-privacidade" className="hover:text-white">Política de Privacidade</a>
                    <a href="/termos-uso" className="hover:text-white">Termos de Uso</a>
                </div>
            </div>
        </footer>
    );
}
