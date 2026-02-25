'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { trackPixelEvent } from '@/components/MetaPixel';
import { trackGoogleAdConversion } from '@/components/GoogleTag';

export function HeroButtons() {
    const sendMessage = () => {
        trackPixelEvent('Contact', { type: 'WhatsApp Button Click' });
        trackGoogleAdConversion('WhatsAppClick');
        const msg = 'Olá! Gostaria de uma cotação do Prevent Senior.';
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const openChat = () => {
        window.dispatchEvent(new Event('open-chat'));
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                onClick={sendMessage}
                id="hero-whatsapp-btn"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-1 uppercase tracking-wide text-sm flex items-center justify-center gap-2"
            >
                <Phone className="w-4 h-4" />
                Falar no WhatsApp
            </button>
            <button
                onClick={openChat}
                id="hero-chat-btn"
                className="bg-white/10 hover:bg-white/20 hover:backdrop-blur-md backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full border border-white/20 transition-all hover:-translate-y-1 uppercase tracking-wide text-sm flex items-center justify-center gap-2"
            >
                <MessageCircle className="w-4 h-4" />
                Simular Plano Online
            </button>
        </div>
    );
}
