import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { MetaPixel } from '@/components/MetaPixel'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Plano de Saúde Prevent Senior | Tabela de Preços 2025 e Cotação Online',
    verification: {
        google: 'ZeBUEjpE_S46Z2aDEJqiFcXDZjh9si70ixxi31NLS0Y',
    },
    description:
        'Contrate o plano de saúde Prevent Senior com tabela de preços 2025 atualizada. Especialista em planos para idosos e terceira idade (50+). Rede própria Sancta Maggiore em SP e RJ. Carência reduzida. Simule agora!',
    keywords: [
        'Prevent Senior',
        'plano de saúde Prevent Senior',
        'preço plano Prevent Senior 2025',
        'tabela de preços Prevent Senior',
        'contratar Prevent Senior',
        'plano de saúde para idosos',
        'plano de saúde terceira idade',
        'plano de saúde 50+',
        'convênio médico para idosos São Paulo',
        'Prevent Senior São Paulo',
        'Prevent Senior Rio de Janeiro',
        'Sancta Maggiore plano de saúde',
        'cotação Prevent Senior',
        'plano Prevent Senior enfermaria',
        'plano Prevent Senior apartamento',
        'prevent senior sem reajuste por idade',
    ],
    metadataBase: new URL('https://preventseniormelhoridade.com.br'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Plano de Saúde Prevent Senior | Preços e Cotação 2025',
        description:
            'Tabela de Preços Prevent Senior 2025. Rede Sancta Maggiore. O melhor plano de saúde para a terceira idade. Sem reajuste por faixa etária a partir dos 50 anos.',
        url: 'https://preventseniormelhoridade.com.br',
        siteName: 'Prevent Senior — Cotação Online',
        images: [
            {
                url: '/images/prevent-hero.png',
                width: 1200,
                height: 630,
                alt: 'Plano de Saúde Prevent Senior — Tabela de Preços 2025',
            },
        ],
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Plano de Saúde Prevent Senior | Preços 2025',
        description: 'Tabela de preços Prevent Senior 2025. Contrate online. Especialista no Adulto+.',
        images: ['/images/prevent-hero.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
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