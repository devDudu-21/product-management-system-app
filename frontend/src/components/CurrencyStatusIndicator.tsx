import { useState, useEffect } from "react";
import { useCurrency } from "../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { TrendingUp, Clock, Wifi, WifiOff, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip";

interface CurrencyStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function CurrencyStatusIndicator({
  className = "",
  showDetails = true,
  compact = false,
}: CurrencyStatusIndicatorProps) {
  const {
    currentCurrency,
    exchangeRates,
    lastUpdated,
    isLoading,
    getCurrencySymbol,
    hasValidData,
  } = useCurrency();
  const { t } = useTranslation();

  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "offline" | "error"
  >("online");

  useEffect(() => {
    const checkStatus = () => {
      if (!navigator.onLine) {
        setConnectionStatus("offline");
        return;
      }

      if (isLoading) {
        setConnectionStatus("online");
        return;
      }

      const hasMinimalData = exchangeRates.BRL === 1.0;

      if (!hasValidData && !hasMinimalData) {
        setConnectionStatus("error");
        return;
      }

      if (!lastUpdated) {
        if (hasMinimalData) {
          setConnectionStatus("online");
        } else {
          setConnectionStatus("error");
        }
        return;
      }

      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (hours > 24) {
        setConnectionStatus("error");
      } else {
        setConnectionStatus("online");
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated, isLoading, hasValidData, exchangeRates, currentCurrency]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return t("currency.never", "Nunca");

    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return t("currency.justNow", "Agora");
    if (minutes < 60) return `${minutes}min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return (
        <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
      );
    }

    switch (connectionStatus) {
      case "online":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "offline":
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    if (isLoading) return "text-blue-500";

    switch (connectionStatus) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-gray-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusMessage = () => {
    if (isLoading) return t("currency.updating", "Atualizando...");

    switch (connectionStatus) {
      case "online":
        return t("currency.upToDate", "Atualizado");
      case "offline":
        return t("currency.offline", "Offline");
      case "error":
        return t("currency.outdated", "Desatualizado");
      default:
        return "";
    }
  };

  const getCurrentRate = () => {
    if (currentCurrency === "BRL") return 1;
    return exchangeRates[currentCurrency] || null;
  };

  const currentRate = getCurrentRate();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1 ${className}`}>
              {getStatusIcon()}
              <span className={`text-xs font-medium ${getStatusColor()}`}>
                {getCurrencySymbol()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-medium">{currentCurrency}</div>
              <div className="text-gray-400">
                {getStatusMessage()} • {formatLastUpdated()}
              </div>
              {currentRate && currentRate !== 1 && (
                <div className="text-gray-400">
                  1 BRL = {currentRate.toFixed(4)} {currentCurrency}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm ${className}`}
    >
      {getStatusIcon()}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {getCurrencySymbol()} {currentCurrency}
          </span>
          {currentRate && currentRate !== 1 && (
            <div className="flex items-center gap-1 text-xs text-white/70">
              <TrendingUp className="w-3 h-3" />
              <span>{currentRate.toFixed(4)}</span>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Clock className="w-3 h-3" />
            <span>{getStatusMessage()}</span>
            <span>•</span>
            <span>{formatLastUpdated()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
