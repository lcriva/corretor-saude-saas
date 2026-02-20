export type PlanType = 'ENFERMARIA' | 'APARTAMENTO';

export interface AgeRange {
    label: string;
    min: number;
    max: number;
}

export interface QuoteItem {
    label: string;
    age: number;
    range: string;
    value: number;
}

export interface QuoteResult {
    planType: string;
    items: QuoteItem[];
    total: number;
}

export class PricingService {
    private readonly PRICES = {
        ENFERMARIA: {
            ATE_43: 883.53,
            DE_44_58: 1162.60,
            MAIS_59: 1529.75
        },
        APARTAMENTO: {
            ATE_43: 1055.50,
            DE_44_58: 1389.60,
            MAIS_59: 1828.43
        }
    };

    getAgeRange(age: number): string {
        if (age <= 43) return "Até 43 anos";
        if (age <= 58) return "44 a 58 anos";
        return "59 anos em diante";
    }

    private getPriceKey(age: number): keyof typeof this.PRICES.ENFERMARIA {
        if (age <= 43) return 'ATE_43';
        if (age <= 58) return 'DE_44_58';
        return 'MAIS_59';
    }

    getPrice(planType: PlanType, age: number): number {
        const key = this.getPriceKey(age);
        return this.PRICES[planType][key];
    }

    buildQuote(ages: number[]): { enfermaria: QuoteResult, apartamento: QuoteResult } {
        const build = (type: PlanType): QuoteResult => {
            const items = ages.map((age, index) => ({
                label: index === 0 ? "Titular" : `Dependente ${index}`,
                age,
                range: this.getAgeRange(age),
                value: this.getPrice(type, age)
            }));
            const total = items.reduce((acc, item) => acc + item.value, 0);
            return {
                planType: type === 'ENFERMARIA' ? "Plano Enfermaria" : "Plano Apartamento",
                items,
                total
            };
        };

        return {
            enfermaria: build('ENFERMARIA'),
            apartamento: build('APARTAMENTO')
        };
    }

    formatCurrency(value: number): string {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    formatQuote(quote: QuoteResult): string {
        let text = `*Tipo de Plano: ${quote.planType}*\n`;

        if (quote.items.length === 1) {
            const item = quote.items[0];
            text += `- Titular (idade ${item.age} / faixa ${item.range}): ${this.formatCurrency(item.value)}\n`;
        } else {
            quote.items.forEach(item => {
                text += `- ${item.label} (idade ${item.age} / faixa ${item.range}): ${this.formatCurrency(item.value)}\n`;
            });
            text += `*Total (${quote.items.length} pessoas): ${this.formatCurrency(quote.total)}*\n`;
        }

        return text;
    }
}

export const pricingService = new PricingService();
