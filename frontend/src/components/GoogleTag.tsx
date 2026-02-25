'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';

export const GoogleTag = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!GA_TRACKING_ID) return;

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('config', GA_TRACKING_ID, {
                page_path: pathname + searchParams.toString(),
            });
        }
    }, [pathname, searchParams]);

    if (!GA_TRACKING_ID) {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
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
