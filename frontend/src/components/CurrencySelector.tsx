import { useState } from "react";
import { DollarSign, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useCurrency } from "../hooks/useCurrency";

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentCurrency,
    setCurrency,
    getSupportedCurrencies,
    getCurrencySymbol,
  } = useCurrency();

  const currencies = getSupportedCurrencies();

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        <DollarSign className="w-4 h-4" />
        <span className="font-semibold">{getCurrencySymbol()}</span>
        <span className="hidden sm:inline">{currentCurrency}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Select Currency
            </div>
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center justify-between rounded-md transition-colors ${
                  currentCurrency === currency.code
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">
                    {currency.symbol}
                  </span>
                  <div>
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-sm text-gray-500">{currency.name}</div>
                  </div>
                </div>
                {currentCurrency !== "BRL" && currency.code !== "BRL" && (
                  <div className="text-xs text-gray-400">
                    1 BRL ≈ {currency.rate.toFixed(3)} {currency.code}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-3">
            <div className="text-xs text-gray-500 text-center">
              💡 Prices are stored in BRL and converted automatically
            </div>
          </div>
        </div>
      )}

      {/* overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
