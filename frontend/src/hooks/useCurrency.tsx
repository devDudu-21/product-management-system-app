import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { CurrencyService, CurrencyConfig } from "../services/currencyService";

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  convertFromBRL: (amount: number) => number;
  convertToBRL: (amount: number) => number;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  getSupportedCurrencies: () => CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currentCurrency, setCurrentCurrency] = useState<string>("BRL");
  const currencyService = CurrencyService.getInstance();

  useEffect(() => {
    // load saved currency from localStorage
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency && currencyService.getCurrencyConfig(savedCurrency)) {
      setCurrentCurrency(savedCurrency);
    }
  }, [currencyService]);

  const setCurrency = (currency: string) => {
    setCurrentCurrency(currency);
    localStorage.setItem("selectedCurrency", currency);
  };

  const convertFromBRL = (amount: number): number => {
    return currencyService.convertFromBRL(amount, currentCurrency);
  };

  const convertToBRL = (amount: number): number => {
    return currencyService.convertToBRL(amount, currentCurrency);
  };

  const formatCurrency = (amount: number): string => {
    return currencyService.formatCurrency(amount, currentCurrency);
  };

  const getCurrencySymbol = (): string => {
    const config = currencyService.getCurrencyConfig(currentCurrency);
    return config?.symbol || "R$";
  };

  const getSupportedCurrencies = (): CurrencyConfig[] => {
    return currencyService.getSupportedCurrencies();
  };

  const value: CurrencyContextType = {
    currentCurrency,
    setCurrency,
    convertFromBRL,
    convertToBRL,
    formatCurrency,
    getCurrencySymbol,
    getSupportedCurrencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
