import {
  ConvertCurrency,
  GetSupportedCurrencies,
  GetExchangeRatesForCurrency,
  ClearCurrencyCache,
} from "../../wailsjs/go/main/App";
import { CurrencyConversionCache } from "../utils/currencyCache";

export interface ExchangeRates {
  [currency: string]: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rate: number; // currency conversion rate relative to BRL
}

export class CurrencyService {
  private static instance: CurrencyService;
  private supportedCurrencies: CurrencyConfig[] = [];
  private exchangeRates: ExchangeRates = {};
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000;
  private conversionCache: CurrencyConversionCache;

  private constructor() {
    this.initializeBasicData();
    this.loadSupportedCurrencies();
    this.conversionCache = CurrencyConversionCache.getInstance();
  }

  private initializeBasicData(): void {
    this.supportedCurrencies = [
      { code: "BRL", symbol: "R$", name: "Real Brasileiro", rate: 1.0 },
      { code: "USD", symbol: "$", name: "US Dollar", rate: 0.2 },
      { code: "EUR", symbol: "€", name: "Euro", rate: 0.18 },
      { code: "GBP", symbol: "£", name: "British Pound", rate: 0.15 },
      { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 30.0 },
      { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 0.27 },
      { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 0.3 },
      { code: "CHF", symbol: "CHF", name: "Swiss Franc", rate: 0.18 },
      { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 1.45 },
      { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 16.8 },
    ];

    this.exchangeRates = {
      BRL: 1.0,
      USD: 0.2,
      EUR: 0.18,
      GBP: 0.15,
      JPY: 30.0,
      CAD: 0.27,
      AUD: 0.3,
      CHF: 0.18,
      CNY: 1.45,
      INR: 16.8,
    };

    this.lastFetchTime = Date.now();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private async loadSupportedCurrencies(): Promise<void> {
    try {
      const response = await GetSupportedCurrencies();
      this.supportedCurrencies = response.currencies.map(currency => ({
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name,
        rate: this.exchangeRates[currency.code] || 1.0,
      }));

      await this.updateExchangeRatesFromBackend();
    } catch (error) {
      console.error("Error loading supported currencies:", error);
    }
  }

  private async updateExchangeRatesFromBackend(): Promise<void> {
    try {
      const response = await GetExchangeRatesForCurrency("BRL");
      if (response.rates) {
        this.exchangeRates = { BRL: 1.0, ...response.rates };

        this.supportedCurrencies = this.supportedCurrencies.map(currency => ({
          ...currency,
          rate: this.exchangeRates[currency.code] || currency.rate,
        }));

        this.lastFetchTime = Date.now();
      }
    } catch (error) {
      console.error("Error updating exchange rates:", error);
    }
  }

  private async ensureRatesUpdated(): Promise<void> {
    const now = Date.now();
    if (now - this.lastFetchTime > this.CACHE_DURATION) {
      await this.updateExchangeRatesFromBackend();
    }
  }

  public async convertFromBRL(
    amount: number,
    toCurrency: string
  ): Promise<number> {
    if (toCurrency === "BRL") return amount;

    const cacheKey = { amount, fromCurrency: "BRL", toCurrency };
    const cachedResult = this.conversionCache.get(cacheKey);

    if (cachedResult !== null) {
      this.conversionCache.recordHit();
      return cachedResult;
    }

    this.conversionCache.recordMiss();

    try {
      await this.ensureRatesUpdated();

      const response = await ConvertCurrency({
        amount,
        fromCurrency: "BRL",
        toCurrency,
      });

      this.conversionCache.set(
        cacheKey,
        response.convertedAmount,
        response.exchangeRate
      );

      return response.convertedAmount;
    } catch (error) {
      console.error(`Error converting from BRL to ${toCurrency}:`, error);

      const rate = this.exchangeRates[toCurrency];
      if (rate) {
        const result = amount * rate;
        this.conversionCache.set(cacheKey, result, rate);
        return result;
      }

      return amount;
    }
  }

  public async convertToBRL(
    amount: number,
    fromCurrency: string
  ): Promise<number> {
    if (fromCurrency === "BRL") return amount;

    const cacheKey = { amount, fromCurrency, toCurrency: "BRL" };
    const cachedResult = this.conversionCache.get(cacheKey);

    if (cachedResult !== null) {
      this.conversionCache.recordHit();
      return cachedResult;
    }

    this.conversionCache.recordMiss();

    try {
      await this.ensureRatesUpdated();

      const response = await ConvertCurrency({
        amount,
        fromCurrency,
        toCurrency: "BRL",
      });

      this.conversionCache.set(
        cacheKey,
        response.convertedAmount,
        response.exchangeRate
      );

      return response.convertedAmount;
    } catch (error) {
      console.error(`Error converting from ${fromCurrency} to BRL:`, error);

      const rate = this.exchangeRates[fromCurrency];
      if (rate) {
        const result = amount / rate;
        this.conversionCache.set(cacheKey, result, 1 / rate);
        return result;
      }

      return amount;
    }
  }

  public async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const cacheKey = { amount, fromCurrency, toCurrency };
    const cachedResult = this.conversionCache.get(cacheKey);

    if (cachedResult !== null) {
      this.conversionCache.recordHit();
      return cachedResult;
    }

    this.conversionCache.recordMiss();

    try {
      const response = await ConvertCurrency({
        amount,
        fromCurrency,
        toCurrency,
      });

      this.conversionCache.set(
        cacheKey,
        response.convertedAmount,
        response.exchangeRate
      );

      return response.convertedAmount;
    } catch (error) {
      console.error(
        `Error converting from ${fromCurrency} to ${toCurrency}:`,
        error
      );
      return amount;
    }
  }

  public formatCurrency(
    amount: number,
    currency: string,
    locale?: string
  ): string {
    const config = this.getCurrencyConfig(currency);
    if (!config) {
      return `${amount.toFixed(2)}`;
    }

    const localeMap: Record<string, string> = {
      BRL: "pt-BR",
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
      JPY: "ja-JP",
      CAD: "en-CA",
      AUD: "en-AU",
      CHF: "de-CH",
      CNY: "zh-CN",
      INR: "en-IN",
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

  public async refreshExchangeRates(): Promise<void> {
    try {
      await ClearCurrencyCache();
      this.conversionCache.clear();
      await this.updateExchangeRatesFromBackend();
    } catch (error) {
      console.error("Error refreshing exchange rates:", error);
    }
  }

  public getCurrencyConfig(currency: string): CurrencyConfig | null {
    return this.supportedCurrencies.find(c => c.code === currency) || null;
  }

  public getSupportedCurrencies(): CurrencyConfig[] {
    return this.supportedCurrencies;
  }

  public getExchangeRates(): ExchangeRates {
    return { ...this.exchangeRates };
  }

  public hasValidData(): boolean {
    return Object.keys(this.exchangeRates).length > 0;
  }

  public getLastFetchTime(): Date | null {
    return this.lastFetchTime > 0 ? new Date(this.lastFetchTime) : null;
  }

  public getCacheStats() {
    return this.conversionCache.getStats();
  }

  public async preloadCommonConversions(): Promise<void> {
    const currencies = this.supportedCurrencies.map(c => c.code);
    const commonAmounts = [1, 10, 50, 100, 500, 1000];

    await this.conversionCache.preloadCommonConversions(
      commonAmounts,
      currencies,
      this.convertCurrency.bind(this)
    );
  }
}
