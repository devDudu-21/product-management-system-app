import { useState, useEffect, useMemo } from "react";
import { useCurrency } from "../hooks/useCurrency";
import { useTranslation } from "react-i18next";

interface PriceDisplayProps {
  price: number;
  className?: string;
  showOriginalPrice?: boolean;
  showConversionRate?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "emphasized" | "subtle";
}

export function PriceDisplay({
  price,
  className = "",
  showOriginalPrice = false,
  showConversionRate = false,
  size = "md",
  variant = "default",
}: PriceDisplayProps) {
  const [convertedPrice, setConvertedPrice] = useState<number>(price);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const {
    convertFromBRL,
    formatCurrency,
    currentCurrency,
    isLoading: globalLoading,
  } = useCurrency();
  const { t } = useTranslation();

  const formattedPrice = useMemo(() => {
    return formatCurrency(convertedPrice);
  }, [convertedPrice, formatCurrency]);

  const formattedOriginalPrice = useMemo(() => {
    if (currentCurrency === "BRL") return null;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }, [price, currentCurrency]);

  useEffect(() => {
    let isCancelled = false;

    const convertPrice = async () => {
      if (currentCurrency === "BRL") {
        setConvertedPrice(price);
        setConversionRate(1);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const converted = await convertFromBRL(price);

        if (!isCancelled) {
          setConvertedPrice(converted);
          setConversionRate(price > 0 ? converted / price : 1);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error converting price:", err);
          setError(t("currency.rateError", "Erro ao converter"));
          setConvertedPrice(price);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(convertPrice, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [price, currentCurrency, convertFromBRL, t]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  };

  const variantClasses = {
    default: "",
    emphasized: "font-bold text-green-700",
    subtle: "text-gray-600",
  };

  const containerClass = `inline-flex flex-col ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (isLoading || globalLoading) {
    return (
      <div className={containerClass}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          <span className="text-gray-500">
            {t("currency.converting", "Convertendo...")}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className="flex items-center gap-1 text-red-500">
          <span className="text-xs">⚠️</span>
          <span>{formattedOriginalPrice || formatCurrency(price)}</span>
        </div>
        {showOriginalPrice && formattedOriginalPrice && (
          <span className="text-xs text-gray-400 mt-1">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-1">
        <span>{formattedPrice}</span>
        {currentCurrency !== "BRL" && showConversionRate && (
          <span className="text-xs text-gray-400">
            (×{conversionRate.toFixed(4)})
          </span>
        )}
      </div>

      {showOriginalPrice && formattedOriginalPrice && (
        <span className="text-xs text-gray-500 mt-1">
          {t("currency.originalPrice", "Original")}: {formattedOriginalPrice}
        </span>
      )}
    </div>
  );
}
