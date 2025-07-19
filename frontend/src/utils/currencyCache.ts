interface CachedConversion {
  convertedAmount: number;
  timestamp: number;
  rate: number;
}

interface ConversionKey {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export class CurrencyConversionCache {
  private static instance: CurrencyConversionCache;
  private cache: Map<string, CachedConversion> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 1000;

  private constructor() {
    setInterval(() => this.cleanExpiredEntries(), 60000);
  }

  public static getInstance(): CurrencyConversionCache {
    if (!CurrencyConversionCache.instance) {
      CurrencyConversionCache.instance = new CurrencyConversionCache();
    }
    return CurrencyConversionCache.instance;
  }

  private generateKey(key: ConversionKey): string {
    const roundedAmount = Math.round(key.amount * 100) / 100;
    return `${roundedAmount}:${key.fromCurrency}:${key.toCurrency}`;
  }

  public get(key: ConversionKey): number | null {
    const cacheKey = this.generateKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.convertedAmount;
  }

  public set(key: ConversionKey, convertedAmount: number, rate: number): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanOldestEntries();
    }

    const cacheKey = this.generateKey(key);
    this.cache.set(cacheKey, {
      convertedAmount,
      timestamp: Date.now(),
      rate,
    });
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private cleanOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): {
    size: number;
    hitRate: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());

    let oldest = Infinity;
    let newest = 0;

    entries.forEach(entry => {
      if (entry.timestamp < oldest) oldest = entry.timestamp;
      if (entry.timestamp > newest) newest = entry.timestamp;
    });

    return {
      size: this.cache.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      oldestEntry: oldest === Infinity ? null : new Date(oldest),
      newestEntry: newest === 0 ? null : new Date(newest),
    };
  }

  private hitCount = 0;
  private missCount = 0;

  public recordHit(): void {
    this.hitCount++;
  }

  public recordMiss(): void {
    this.missCount++;
  }

  public async preloadCommonConversions(
    amounts: number[],
    currencies: string[],
    conversionFunction: (
      amount: number,
      from: string,
      to: string
    ) => Promise<number>
  ): Promise<void> {
    const commonAmounts = [1, 10, 100, 1000];
    const promises: Promise<void>[] = [];

    for (const amount of [...amounts, ...commonAmounts]) {
      for (const fromCurrency of currencies) {
        for (const toCurrency of currencies) {
          if (fromCurrency !== toCurrency) {
            promises.push(
              conversionFunction(amount, fromCurrency, toCurrency)
                .then(result => {
                  this.set(
                    { amount, fromCurrency, toCurrency },
                    result,
                    result / amount
                  );
                })
                .catch(() => {})
            );
          }
        }
      }
    }

    const batches = [];
    for (let i = 0; i < promises.length; i += 10) {
      batches.push(promises.slice(i, i + 10));
    }

    for (const batch of batches) {
      await Promise.allSettled(batch);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
