import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { MetaPixel } from '@/components/MetaPixel'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Prevent Senior | Plano de Saúde para Idosos e Terceira Idade 50+',
    description: 'Cotação Prevent Senior com Tabela de Preços 2025. Planos de saúde para idosos e terceira idade (50+) com rede própria e carência reduzida. Simule agora!',
    keywords: [
        'Prevent Senior',
        'Preço plano Prevent Senior',
        'Contratar plano de saúde prevent senior',
        'plano de saúde para terceira idade',
        'plano de saúde para idosos',
        'plano de saúde 50+',
        'redução do valor de planos de saúde',
        'convênio médico para idosos',
        'prevent senior vendas',
        'prevent senior tabela de preços'
    ],
    openGraph: {
        title: 'Prevent Senior | Plano de Saúde Especialista no Adulto+',
        description: 'Tabela de Preços e Rede Credenciada Prevent Senior. O melhor plano de saúde para a terceira idade. Cote Online!',
        url: 'https://preventseniormelhoridade.com.br',
        siteName: 'Prevent Senior Vendas',
        images: [
            {
                url: '/images/prevent-hero.png', // Fallback to hero image if available, or logo
                width: 1200,
                height: 630,
            },
        ],
        locale: 'pt_BR',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <Suspense fallback={null}>
                    <MetaPixel />
                </Suspense>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}