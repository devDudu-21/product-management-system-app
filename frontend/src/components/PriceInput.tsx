import * as React from "react";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  (
    { value, onChange, placeholder, className, disabled, id, ...props },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");

    // restart the value display when the component mounts
    React.useEffect(() => {
      if (value === 0) {
        setDisplayValue("");
      } else {
        setDisplayValue(value.toString());
      }
    }, [value]);

    const handlePriceInput = (inputValue: string): string => {
      const cleaned = inputValue.replace(/[^0-9.,]/g, "");
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
      if (!val || val === "") return 0;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cleanedValue = handlePriceInput(inputValue);
      setDisplayValue(cleanedValue);
      onChange(parsePrice(cleanedValue));
    };

    const handleBlur = () => {
      if (value > 0) {
        const formatted =
          value % 1 === 0
            ? value.toString()
            : value.toFixed(2).replace(/\.?0+$/, "");
        setDisplayValue(formatted);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // allow: backspace, delete, tab, escape, enter
      if (
        [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        return;
      }

      // allow: números (0-9)
      if (
        (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
        (e.keyCode < 96 || e.keyCode > 105) &&
        // allow: vírgula e ponto
        e.keyCode !== 188 &&
        e.keyCode !== 190 &&
        e.keyCode !== 110
      ) {
        e.preventDefault();
      }
    };

    return (
      <Input
        ref={ref}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(className)}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
        {...props}
      />
    );
  }
);

PriceInput.displayName = "PriceInput";
