'use client';

import { trackPixelEvent } from '@/components/MetaPixel';

interface PlanButtonProps {
    label: string;
    variant?: 'dark' | 'blue';
}

export function PlanButton({ label, variant = 'blue' }: PlanButtonProps) {
    const handleClick = () => {
        trackPixelEvent('Contact', { type: `Plan Button - ${label}` });
        const msg = `Olá! Gostaria de contratar o plano Prevent Senior - ${label}.`;
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const cls = variant === 'dark'
        ? 'w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-bold transition-all transform active:scale-95'
        : 'w-full mt-8 bg-[#007aff] hover:bg-[#0062cc] text-white py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-[#007aff]/30';

    return (
        <button onClick={handleClick} className={cls}>
            {label}
        </button>
    );
}

export function NetworkButton() {
    const handleClick = () => {
        trackPixelEvent('Contact', { type: 'Network Button Click' });
        const msg = 'Olá! Gostaria de consultar a rede credenciada Prevent Senior.';
        window.open(`https://wa.me/5511967609811?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="border border-white/20 hover:bg-white hover:text-[#0f192b] text-white px-8 py-3 rounded-full font-bold transition-all"
        >
            Consultar Rede Completa
        </button>
    );
}
