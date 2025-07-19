import { useState, useEffect, useCallback } from "react";
import { CurrencyService } from "../services/currencyService";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface CacheStats {
  size: number;
  hitRate: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export function CurrencyDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {}
  );

  const currencyService = CurrencyService.getInstance();

  const loadStats = useCallback(() => {
    const cacheStats = currencyService.getCacheStats();
    const rates = currencyService.getExchangeRates();

    setStats(cacheStats);
    setExchangeRates(rates);
  }, [currencyService]);

  useEffect(() => {
    if (isOpen) {
      loadStats();
      const interval = setInterval(loadStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, loadStats]);

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3"
        title="Currency Debug Panel"
      >
        <BarChart3 className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Currency Debug</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStats}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {stats && (
            <div className="space-y-3">
              {/* cache statistics */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Cache Statistics
                </h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Cache Size:</span>
                    <span className="font-mono">{stats.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className="font-mono">
                      {(stats.hitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oldest Entry:</span>
                    <span className="font-mono">
                      {stats.oldestEntry
                        ? new Date(stats.oldestEntry).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Newest Entry:</span>
                    <span className="font-mono">
                      {stats.newestEntry
                        ? new Date(stats.newestEntry).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* exchange rates */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Current Rates (vs BRL)
                </h4>
                <div className="space-y-1 text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {Object.entries(exchangeRates).map(([currency, rate]) => (
                    <div key={currency} className="flex justify-between">
                      <span>{currency}:</span>
                      <span className="font-mono">{rate.toFixed(6)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* actions */}
              <div className="space-y-2">
                <Button
                  onClick={() => currencyService.refreshExchangeRates()}
                  className="w-full text-xs"
                  variant="outline"
                  size="sm"
                >
                  Refresh Rates & Clear Cache
                </Button>
                <Button
                  onClick={() => currencyService.preloadCommonConversions()}
                  className="w-full text-xs"
                  variant="outline"
                  size="sm"
                >
                  Preload Common Conversions
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
