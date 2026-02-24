export type PlanType = 'ENFERMARIA' | 'APARTAMENTO';
export type PlanTier = 'PS1025' | 'MAIS';

export interface AgeRange {
    label: string;
    min: number;
    max: number;
}

export interface QuoteItem {
    label: string;
    age: number;
    range: string;
    valor1025E: number;
    valor1025A: number;
    valorMaisE: number;
    valorMaisA: number;
}

export interface QuoteResult {
    planTier: string;
    planType: string;
    items: Array<{ label: string; age: number; range: string; value: number }>;
    total: number;
}

export class PricingService {
    private readonly PRICES = {
        PS1025: {
            ENFERMARIA: { ATE_43: 759.84, DE_44_58: 999.84, MAIS_59: 1315.59 },
            APARTAMENTO: { ATE_43: 907.73, DE_44_58: 1195.06, MAIS_59: 1572.45 },
        },
        MAIS: {
            ENFERMARIA: { ATE_43: 883.53, DE_44_58: 1162.60, MAIS_59: 1529.75 },
            APARTAMENTO: { ATE_43: 1055.50, DE_44_58: 1389.60, MAIS_59: 1828.43 },
        },
    };

    getAgeRange(age: number): string {
        if (age <= 43) return 'Até 43 anos';
        if (age <= 58) return '44 a 58 anos';
        return '59 anos ou mais';
    }

    private getPriceKey(age: number): 'ATE_43' | 'DE_44_58' | 'MAIS_59' {
        if (age <= 43) return 'ATE_43';
        if (age <= 58) return 'DE_44_58';
        return 'MAIS_59';
    }

    getPrice(tier: PlanTier, planType: PlanType, age: number): number {
        const key = this.getPriceKey(age);
        return this.PRICES[tier][planType][key];
    }

    buildQuote(ages: number[]): {
        ps1025_enfermaria: QuoteResult;
        ps1025_apartamento: QuoteResult;
        mais_enfermaria: QuoteResult;
        mais_apartamento: QuoteResult;
    } {
        const build = (tier: PlanTier, type: PlanType): QuoteResult => {
            const items = ages.map((age, index) => ({
                label: index === 0 ? 'Titular' : `Dependente ${index}`,
                age,
                range: this.getAgeRange(age),
                value: this.getPrice(tier, type, age),
            }));
            const total = items.reduce((acc, item) => acc + item.value, 0);
            const tierLabel = tier === 'PS1025' ? 'Prevent Senior 1025' : 'Prevent MAIS';
            const typeLabel = type === 'ENFERMARIA' ? 'Enfermaria' : 'Apartamento';
            return { planTier: tierLabel, planType: typeLabel, items, total };
        };

        return {
            ps1025_enfermaria: build('PS1025', 'ENFERMARIA'),
            ps1025_apartamento: build('PS1025', 'APARTAMENTO'),
            mais_enfermaria: build('MAIS', 'ENFERMARIA'),
            mais_apartamento: build('MAIS', 'APARTAMENTO'),
        };
    }

    formatCurrency(value: number): string {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    formatQuote(quote: QuoteResult): string {
        let text = `*${quote.planTier} — ${quote.planType}*\n`;
        if (quote.items.length === 1) {
            const item = quote.items[0];
            text += `- Titular (${item.age} anos / faixa ${item.range}): ${this.formatCurrency(item.value)}\n`;
        } else {
            quote.items.forEach(item => {
                text += `- ${item.label} (${item.age} anos / faixa ${item.range}): ${this.formatCurrency(item.value)}\n`;
            });
            text += `*Total (${quote.items.length} pessoas): ${this.formatCurrency(quote.total)}*\n`;
        }
        return text;
    }
}

export const pricingService = new PricingService();
