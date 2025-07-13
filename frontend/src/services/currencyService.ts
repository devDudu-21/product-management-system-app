export interface ExchangeRates {
  [currency: string]: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rate: number; // currency conversion rate relative to BRL
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Real Brasileiro",
    rate: 1.0, // base currency
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 0.2, // approximately 1 BRL = 0.2 USD (fixed rate for demo)
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rate: 0.18, // approximately 1 BRL = 0.18 EUR (fixed rate for demo)
  },
};

export class CurrencyService {
  private static instance: CurrencyService;
  private exchangeRates: ExchangeRates = {};

  private constructor() {
    this.exchangeRates = {
      BRL: 1.0,
      USD: 0.2,
      EUR: 0.18,
    };
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  public convertFromBRL(amount: number, toCurrency: string): number {
    const rate = this.exchangeRates[toCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${toCurrency}, using BRL`);
      return amount;
    }
    return amount * rate;
  }

  public convertToBRL(amount: number, fromCurrency: string): number {
    const rate = this.exchangeRates[fromCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency}, using BRL`);
      return amount;
    }
    return amount / rate;
  }

  public formatCurrency(
    amount: number,
    currency: string,
    locale?: string
  ): string {
    const config = SUPPORTED_CURRENCIES[currency];
    if (!config) {
      return `${amount.toFixed(2)}`;
    }

    const localeMap: Record<string, string> = {
      BRL: "pt-BR",
      USD: "en-US",
      EUR: "de-DE",
    };

    const targetLocale = locale || localeMap[currency] || "en-US";

    try {
      return new Intl.NumberFormat(targetLocale, {
        style: "currency",
        currency: currency,
      }).format(amount);
    } catch {
      return `${config.symbol} ${amount.toFixed(2)}`;
    }
  }

  public updateExchangeRates(rates: ExchangeRates): void {
    this.exchangeRates = { ...this.exchangeRates, ...rates };
  }

  public getCurrencyConfig(currency: string): CurrencyConfig | null {
    return SUPPORTED_CURRENCIES[currency] || null;
  }

  public getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(SUPPORTED_CURRENCIES);
  }
}
