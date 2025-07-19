import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { CurrencyService, CurrencyConfig } from "../services/currencyService";

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  convertFromBRL: (amount: number) => Promise<number>;
  convertToBRL: (amount: number) => Promise<number>;
  convertCurrency: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => Promise<number>;
  formatCurrency: (amount: number, currency?: string) => string;
  getCurrencySymbol: (currency?: string) => string;
  getSupportedCurrencies: () => CurrencyConfig[];
  refreshExchangeRates: () => Promise<void>;
  isLoading: boolean;
  exchangeRates: { [key: string]: number };
  lastUpdated: Date | null;
  hasValidData: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currentCurrency, setCurrentCurrency] = useState<string>("BRL");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Memoize o serviço para evitar recriações
  const currencyService = useMemo(() => CurrencyService.getInstance(), []);

  // Carregar moeda salva e inicializar
  useEffect(() => {
    const initializeCurrency = async () => {
      // Carregar moeda salva do localStorage
      const savedCurrency = localStorage.getItem("selectedCurrency");
      if (savedCurrency && currencyService.getCurrencyConfig(savedCurrency)) {
        setCurrentCurrency(savedCurrency);
      }

      // Sempre definir lastUpdated baseado no serviço
      const serviceLastFetch = currencyService.getLastFetchTime();
      if (serviceLastFetch) {
        setLastUpdated(serviceLastFetch);
      } else {
        // Se não há timestamp do serviço, usar timestamp atual já que sempre temos dados básicos
        setLastUpdated(new Date());
      }

      // Verificar se precisa atualizar dados do backend
      const rates = currencyService.getExchangeRates();
      if (Object.keys(rates).length < 10) {
        // Não temos todas as moedas ainda
        try {
          setIsLoading(true);
          await currencyService.refreshExchangeRates();
          setLastUpdated(new Date());
        } catch (error) {
          console.warn("Failed to refresh exchange rates on init:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeCurrency();
  }, [currencyService]);

  const setCurrency = useCallback(
    (currency: string) => {
      if (currencyService.getCurrencyConfig(currency)) {
        setCurrentCurrency(currency);
        localStorage.setItem("selectedCurrency", currency);
      } else {
        console.warn(`Currency ${currency} is not supported`);
      }
    },
    [currencyService]
  );

  const convertFromBRL = useCallback(
    async (amount: number): Promise<number> => {
      if (amount === 0) return 0;
      if (currentCurrency === "BRL") return amount;

      try {
        const result = await currencyService.convertFromBRL(
          amount,
          currentCurrency
        );
        return result;
      } catch (error) {
        console.error("Error converting from BRL:", error);

        const rates = currencyService.getExchangeRates();
        const rate = rates[currentCurrency];
        if (rate) {
          return amount * rate;
        }

        return amount;
      }
    },
    [currencyService, currentCurrency]
  );

  const convertToBRL = useCallback(
    async (amount: number): Promise<number> => {
      if (amount === 0) return 0;
      if (currentCurrency === "BRL") return amount;

      try {
        const result = await currencyService.convertToBRL(
          amount,
          currentCurrency
        );
        return result;
      } catch (error) {
        console.error("Error converting to BRL:", error);

        const rates = currencyService.getExchangeRates();
        const rate = rates[currentCurrency];
        if (rate) {
          return amount / rate;
        }

        return amount;
      }
    },
    [currencyService, currentCurrency]
  );

  const convertCurrency = useCallback(
    async (
      amount: number,
      fromCurrency: string,
      toCurrency: string
    ): Promise<number> => {
      if (amount === 0) return 0;
      if (fromCurrency === toCurrency) return amount;

      try {
        const result = await currencyService.convertCurrency(
          amount,
          fromCurrency,
          toCurrency
        );
        return result;
      } catch (error) {
        console.error("Error converting currency:", error);
        return amount;
      }
    },
    [currencyService]
  );

  const formatCurrency = useCallback(
    (amount: number, currency?: string): string => {
      const targetCurrency = currency || currentCurrency;
      return currencyService.formatCurrency(amount, targetCurrency);
    },
    [currencyService, currentCurrency]
  );

  const getCurrencySymbol = useCallback(
    (currency?: string): string => {
      const targetCurrency = currency || currentCurrency;
      const config = currencyService.getCurrencyConfig(targetCurrency);
      return config?.symbol || "R$";
    },
    [currencyService, currentCurrency]
  );

  const getSupportedCurrencies = useCallback((): CurrencyConfig[] => {
    return currencyService.getSupportedCurrencies();
  }, [currencyService]);

  const refreshExchangeRates = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await currencyService.refreshExchangeRates();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currencyService]);

  const exchangeRates = useMemo(() => {
    return currencyService.getExchangeRates();
  }, [currencyService]);

  const hasValidData = useMemo(() => {
    return currencyService.hasValidData();
  }, [currencyService]);

  const value: CurrencyContextType = useMemo(
    () => ({
      currentCurrency,
      setCurrency,
      convertFromBRL,
      convertToBRL,
      convertCurrency,
      formatCurrency,
      getCurrencySymbol,
      getSupportedCurrencies,
      refreshExchangeRates,
      isLoading,
      exchangeRates,
      lastUpdated,
      hasValidData,
    }),
    [
      currentCurrency,
      setCurrency,
      convertFromBRL,
      convertToBRL,
      convertCurrency,
      formatCurrency,
      getCurrencySymbol,
      getSupportedCurrencies,
      refreshExchangeRates,
      isLoading,
      exchangeRates,
      lastUpdated,
      hasValidData,
    ]
  );

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
