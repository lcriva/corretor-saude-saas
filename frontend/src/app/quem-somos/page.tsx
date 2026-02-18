
'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';

export default function QuemSomos() {
    return (
        <div className="min-h-screen font-sans text-[#333]">
            <Header />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0f192b] mb-12 text-center">Quem Somos</h1>

                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">

                            {/* Banner Top Text */}
                            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm mb-12">
                                <p className="text-xl text-[#007aff] font-medium text-center">
                                    A Prevent Senior é a operadora de saúde especialista em cuidar de pessoas. Sabemos que a saúde é fundamental para alcançar sonhos e desfrutar o melhor da vida.
                                </p>
                            </div>

                            {/* Main Image */}
                            <figure className="mb-12 rounded-3xl overflow-hidden shadow-lg">
                                <img
                                    src="https://www.preventsenior.com.br/images/20220510_MKT_FACHADA-SEDE-BR-28-Edit-1.jpg"
                                    alt="Sede Prevent Senior"
                                    className="w-full h-auto object-cover"
                                />
                            </figure>

                            {/* History Section */}
                            <section>
                                <p className="mb-6">
                                    Desde 1997, data da inauguração do primeiro hospital da rede Sancta Maggiore, nossa história tem sido marcada por grandes desafios que resultaram no já comprovado sucesso de uma empresa que tem muito a acrescentar para a promoção da saúde no Brasil, principalmente por ser a pioneira no atendimento aos <em>seniors</em>.
                                </p>
                                <p>
                                    Está em nosso DNA promover a saúde de forma diferenciada, com linhas de cuidado desenvolvidas com exclusividade por profissionais especializados que têm em comum a paixão por cuidar das pessoas.
                                </p>
                            </section>

                            <hr className="my-12 border-gray-200" />

                            {/* Innovation Section with Image */}
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <figure className="rounded-3xl overflow-hidden shadow-lg">
                                    <img
                                        src="https://www.preventsenior.com.br/images/20220510_MKT_FACHADA-SEDE-BR-5-copiar-1_2022-05-13-183807_jcjd.jpg"
                                        alt="Fachada Prevent Senior"
                                        className="w-full h-full object-cover"
                                    />
                                </figure>
                                <div>
                                    <p className="mb-6">
                                        É por isso que nós, da Prevent, sempre focamos em estratégias e ações para promover mais saúde e qualidade de vida para que os <em>seniors</em> aproveitem os melhores momentos com quem amam.
                                    </p>
                                    <p className="mb-6">
                                        A Prevent Senior está em constante aperfeiçoamento. É por isso que acreditamos e investimos no poder da inovação e da tecnologia de ponta para propiciar a melhor medicina, garantida por uma ampla rede composta pelos Hospitais e Prontos-Atendimentos Sancta Maggiore, Núcleos de Medicina Avançada e Diagnóstica Prevent Senior e Núcleos especializados em Cardiologia, Oftalmologia, Oncologia, Ortopedia/Traumatologia e Reabilitação.
                                    </p>
                                    <p className="font-medium text-[#0f192b]">
                                        São mais de 45 unidades, 550 mil beneficiários e 14 mil colaboradores, números de uma família que não para de crescer.
                                    </p>
                                </div>
                            </section>

                            {/* Address Section */}
                            <div className="mt-16 bg-[#0f192b] text-white p-8 rounded-3xl text-center">
                                <h3 className="text-xl font-bold mb-4">SEDE BRASIL</h3>
                                <div className="w-16 h-1 bg-[#007aff] mx-auto rounded-full mb-6"></div>
                                <h4 className="font-semibold text-lg mb-2">Prevent Senior Private Operadora de Saúde Ltda.</h4>
                                <p className="text-gray-400">
                                    Av. Brigadeiro Luís Antônio, 3521 ‐ Jardim Paulista ‐ São Paulo/SP
                                    <br />
                                    CEP: 01401‐001
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <ChatWidget />
        </div>
    );
}
