'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17975389741';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-5EJVB7404F';

export const GoogleTag = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window === 'undefined' || !(window as any).gtag) return;

        // Configura Ads se existir
        if (GA_TRACKING_ID) {
            (window as any).gtag('config', GA_TRACKING_ID, {
                page_path: pathname + searchParams.toString(),
            });
        }

        // Configura Analytics se existir
        if (GA_MEASUREMENT_ID) {
            (window as any).gtag('config', GA_MEASUREMENT_ID, {
                page_path: pathname + searchParams.toString(),
            });
        }
    }, [pathname, searchParams]);

    if (!GA_TRACKING_ID && !GA_MEASUREMENT_ID) {
        return null;
    }

    const primaryId = GA_TRACKING_ID || GA_MEASUREMENT_ID;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${GA_TRACKING_ID ? `gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });` : ''}
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });` : ''}
          `,
                }}
            />
        </>
    );
};

// Função para disparar conversões específicas (ex: clique no WhatsApp, Chat iniciado)
export const trackGoogleAdConversion = (label?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag && GA_TRACKING_ID) {
        const payload: any = {
            'send_to': GA_TRACKING_ID + (label ? `/${label}` : ''),
        };
        (window as any).gtag('event', 'conversion', payload);
    }
};
