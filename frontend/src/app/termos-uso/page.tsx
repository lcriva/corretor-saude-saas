'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermosUso() {
    return (
        <div className="min-h-screen font-sans text-[#333]">
            <Header />
            <main className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#0f192b]">Termos de Uso</h1>

                <div className="prose prose-lg max-w-none text-gray-600">
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">1. Termos</h2>
                    <p className="mb-4">
                        Ao acessar ao site, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">2. Isenção de Responsabilidade</h2>
                    <p className="mb-4">
                        Os materiais no site são fornecidos "como estão". Não oferecemos garantias, expressas ou implícitas, e, por este meio, isentamos e negamos todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                    </p>
                    <p className="mb-4">
                        Além disso, não garantimos ou fazemos qualquer representação relativa à precisão, aos resultados prováveis ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">3. Limitações</h2>
                    <p className="mb-4">
                        Em nenhum caso o nosso site ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais, mesmo que tenhamos sido notificados oralmente ou por escrito da possibilidade de tais danos.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">4. Precisão dos materiais</h2>
                    <p className="mb-4">
                        Os materiais exibidos no site podem incluir erros técnicos, tipográficos ou fotográficos. Não garantimos que qualquer material em seu site seja preciso, completo ou atual. Podemos fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, não nos comprometemos a atualizar os materiais.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">5. Links</h2>
                    <p className="mb-4">
                        Não analisamos todos os sites vinculados ao seu site e não somos responsáveis pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por nossa parte do site. O uso de qualquer site vinculado é por conta e risco do usuário.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">Modificações</h2>
                    <p className="mb-4">
                        Podemos revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">Lei aplicável</h2>
                    <p className="mb-4">
                        Estes termos e condições são regidos e interpretados de acordo com as leis locais e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
                    </p>

                    <p className="mt-8 text-sm text-gray-500">
                        Estes termos são efetivos a partir de {new Date().getFullYear()}.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
