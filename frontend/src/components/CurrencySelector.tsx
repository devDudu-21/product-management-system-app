import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  ChevronDown,
  RefreshCw,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { useCurrency } from "../hooks/useCurrency";
import { useTranslation } from "react-i18next";

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const {
    currentCurrency,
    setCurrency,
    getSupportedCurrencies,
    getCurrencySymbol,
    refreshExchangeRates,
    convertCurrency,
    isLoading,
    exchangeRates,
    lastUpdated,
  } = useCurrency();
  const { t } = useTranslation();

  const currencies = useMemo(
    () => getSupportedCurrencies(),
    [getSupportedCurrencies]
  );

  const loadRates = useCallback(async () => {
    if (currencies.length === 0) return;

    try {
      const ratePromises = currencies.map(async currency => {
        if (currency.code === "BRL") return [currency.code, 1];
        try {
          if (exchangeRates[currency.code]) {
            return [currency.code, exchangeRates[currency.code]];
          }

          const rate = await convertCurrency(1, "BRL", currency.code);
          return [currency.code, rate];
        } catch {
          return [currency.code, currency.rate || 1];
        }
      });

      const results = await Promise.all(ratePromises);
      const newRates = Object.fromEntries(results);
      setRates(newRates);
    } catch (error) {
      console.error("Error loading rates:", error);
    }
  }, [currencies, convertCurrency, exchangeRates]);

  useEffect(() => {
    if (currencies.length > 0 && (isOpen || Object.keys(rates).length === 0)) {
      loadRates();
    }
  }, [currencies, isOpen, loadRates]); // Agora usa loadRates memoizado

  const handleCurrencyChange = useCallback(
    (currencyCode: string) => {
      setCurrency(currencyCode);
      setIsOpen(false);
    },
    [setCurrency]
  );

  const handleRefreshRates = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await refreshExchangeRates();
    },
    [refreshExchangeRates]
  );

  const formatLastUpdated = useCallback(() => {
    if (!lastUpdated) return t("currency.never", "Nunca");

    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return t("currency.justNow", "Agora há pouco");
    if (minutes < 60) return t("currency.minutesAgo", `${minutes} min atrás`);

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("currency.hoursAgo", `${hours}h atrás`);

    const days = Math.floor(hours / 24);
    return t("currency.daysAgo", `${days}d atrás`);
  }, [lastUpdated, t]);

  const getStatusColor = useCallback(() => {
    if (!lastUpdated) return "text-gray-500";

    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 30) return "text-green-500";
    if (minutes < 120) return "text-yellow-500";
    return "text-red-500";
  }, [lastUpdated]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        disabled={isLoading}
      >
        <DollarSign className="w-4 h-4" />
        <span className="font-semibold">{getCurrencySymbol()}</span>
        <span className="hidden sm:inline">{currentCurrency}</span>
        <ChevronDown className="w-4 h-4" />
        {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 mb-2">
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-gray-700">
                  {t("currency.selectCurrency", "Selecionar Moeda")}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span className={getStatusColor()}>
                    {t("currency.lastUpdated", "Última atualização")}:{" "}
                    {formatLastUpdated()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshRates}
                className="h-8 w-8 p-0"
                disabled={isLoading}
                title={t("currency.refreshRates", "Atualizar taxas de câmbio")}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {currencies.map(currency => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center justify-between rounded-md transition-colors ${
                    currentCurrency === currency.code
                      ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">
                      {currency.symbol}
                    </span>
                    <div>
                      <div className="font-medium">{currency.code}</div>
                      <div className="text-sm text-gray-500">
                        {currency.name}
                      </div>
                    </div>
                  </div>

                  {currency.code !== "BRL" && rates[currency.code] && (
                    <div className="text-xs text-gray-400 text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>1 BRL ≈</span>
                      </div>
                      <div className="font-medium text-gray-600">
                        {rates[currency.code].toFixed(4)} {currency.code}
                      </div>
                    </div>
                  )}

                  {currentCurrency === currency.code && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="text-xs text-gray-500 text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {t("currency.liveRates", "Taxas de câmbio em tempo real")}
                  </span>
                </div>
                <div>
                  💡{" "}
                  {t(
                    "currency.storedInBRL",
                    "Preços são armazenados em BRL e convertidos automaticamente"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
