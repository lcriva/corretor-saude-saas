'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PoliticaPrivacidade() {
    return (
        <div className="min-h-screen font-sans text-[#333]">
            <Header />
            <main className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#0f192b]">Política de Privacidade</h1>

                <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="mb-4">
                        A sua privacidade é importante para nós. É política do nosso site respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site e em outros sites que possuímos e operamos.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">1. Coleta de Informações</h2>
                    <p className="mb-4">
                        Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">2. Uso de Dados</h2>
                    <p className="mb-4">
                        Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">3. Compartilhamento</h2>
                    <p className="mb-4">
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou para processamento de cotações junto às operadoras de saúde parceiras.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">4. Cookies</h2>
                    <p className="mb-4">
                        O nosso site usa cookies para melhorar a experiência do usuário. Ao continuar navegando, você concorda com o uso de cookies. Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">5. Compromisso do Usuário</h2>
                    <p className="mb-4">
                        O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o site oferece e com caráter enunciativo, mas não limitativo:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
                        <li>B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
                        <li>C) Não causar danos aos sistemas físicos (hardware) e lógicos (software) do site, de seus fornecedores ou terceiros.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0f192b]">6. Mais Informações</h2>
                    <p className="mb-4">
                        Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
                    </p>
                    <p className="mt-8 text-sm text-gray-500">
                        Esta política é efetiva a partir de {new Date().getFullYear()}.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
