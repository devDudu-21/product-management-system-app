import * as React from "react";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import { useCurrency } from "../hooks/useCurrency";
import { useTranslation } from "react-i18next";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  showCurrencyHint?: boolean;
  allowNegative?: boolean;
}

export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      className,
      disabled,
      id,
      showCurrencyHint = true,
      allowNegative = false,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [isConverting, setIsConverting] = React.useState<boolean>(false);
    const [inputInCurrentCurrency, setInputInCurrentCurrency] =
      React.useState<boolean>(false);

    const { currentCurrency, convertFromBRL, convertToBRL, getCurrencySymbol } =
      useCurrency();
    const { t } = useTranslation();

    React.useEffect(() => {
      const initializeDisplayValue = async () => {
        if (value === 0) {
          setDisplayValue("");
          return;
        }

        if (currentCurrency === "BRL") {
          setDisplayValue(value.toString());
          setInputInCurrentCurrency(false);
          return;
        }

        try {
          setIsConverting(true);
          const convertedValue = await convertFromBRL(value);
          setDisplayValue(convertedValue.toString());
          setInputInCurrentCurrency(true);
        } catch (error) {
          console.error("Error converting for display:", error);
          setDisplayValue(value.toString());
          setInputInCurrentCurrency(false);
        } finally {
          setIsConverting(false);
        }
      };

      initializeDisplayValue();
    }, [value, currentCurrency, convertFromBRL]);

    const handlePriceInput = (inputValue: string): string => {
      let cleaned = inputValue.replace(/[^0-9.,-]/g, "");

      if (!allowNegative) {
        cleaned = cleaned.replace(/-/g, "");
      } else {
        const hasNegative = cleaned.startsWith("-");
        cleaned = cleaned.replace(/-/g, "");
        if (hasNegative) cleaned = "-" + cleaned;
      }
      const normalized = cleaned.replace(/,/g, ".");
      const parts = normalized.split(".");

      if (parts.length > 2) {
        return parts[0] + "." + parts.slice(1).join("");
      }

      if (parts[1] && parts[1].length > 2) {
        return parts[0] + "." + parts[1].substring(0, 2);
      }

      return normalized;
    };

    const parsePrice = (val: string): number => {
      if (!val || val === "" || val === "-") return 0;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const handleInputChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const inputValue = e.target.value;
      const cleanedValue = handlePriceInput(inputValue);
      setDisplayValue(cleanedValue);

      const numericValue = parsePrice(cleanedValue);

      if (currentCurrency === "BRL" || numericValue === 0) {
        onChange(numericValue);
        setInputInCurrentCurrency(false);
        return;
      }
      try {
        setIsConverting(true);
        const brlValue = await convertToBRL(numericValue);
        onChange(brlValue);
        setInputInCurrentCurrency(true);
      } catch (error) {
        console.error("Error converting input to BRL:", error);
        onChange(numericValue);
        setInputInCurrentCurrency(false);
      } finally {
        setIsConverting(false);
      }
    };

    const handleBlur = () => {
      if (value > 0) {
        const numericDisplayValue = parsePrice(displayValue);
        if (numericDisplayValue > 0) {
          const formatted =
            numericDisplayValue % 1 === 0
              ? numericDisplayValue.toString()
              : numericDisplayValue.toFixed(2).replace(/\.?0+$/, "");
          setDisplayValue(formatted);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        return;
      }

      if (
        allowNegative &&
        e.keyCode === 189 &&
        e.currentTarget.selectionStart === 0
      ) {
        return;
      }

      if (
        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105) &&
        e.keyCode !== 188 &&
        e.keyCode !== 190 &&
        e.keyCode !== 110
      ) {
        e.preventDefault();
      }
    };

    const dynamicPlaceholder = placeholder || `0.00 ${getCurrencySymbol()}`;

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={dynamicPlaceholder}
          className={cn("pr-16", isConverting && "opacity-75", className)}
          disabled={disabled || isConverting}
          inputMode="decimal"
          autoComplete="off"
          {...props}
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isConverting && (
            <div className="w-3 h-3 border border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
          )}
          <span className="text-xs text-gray-500 font-medium">
            {getCurrencySymbol()}
          </span>
        </div>

        {showCurrencyHint &&
          currentCurrency !== "BRL" &&
          inputInCurrentCurrency && (
            <div className="text-xs text-gray-500 mt-1">
              {t(
                "dialog.editPriceNote",
                "Valor será armazenado em BRL (Real Brasileiro)"
              )}
            </div>
          )}
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";
