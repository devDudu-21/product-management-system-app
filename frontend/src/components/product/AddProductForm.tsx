import { FormEvent, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PriceInput } from "../PriceInput";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddProductFormProps {
  onAdd: (name: string, price: number) => void;
  disabled?: boolean;
}

export function AddProductForm({ onAdd, disabled }: AddProductFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAdd(name, price);
    setName("");
    setPrice(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
    >
      <div className="space-y-2">
        <Label
          htmlFor="productName"
          className="text-sm font-medium text-gray-700"
        >
          {t("product.productName")}
        </Label>
        <Input
          id="productName"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t("product.namePlaceholder")}
          className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="productPrice"
            className="text-sm font-medium text-gray-700"
          >
            {t("product.price")} (BRL)
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer p-1 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#a78bfa" />
                  <text
                    x="12"
                    y="16"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#fff"
                    fontWeight="bold"
                  >
                    i
                  </text>
                </svg>
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-white border border-purple-200 text-gray-700 shadow-lg rounded-lg px-4 py-2 text-xs font-medium max-w-xs">
              {t("product.priceNote")}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative flex items-center gap-2">
          <PriceInput
            id="productPrice"
            value={price}
            onChange={setPrice}
            placeholder={t("product.pricePlaceholder")}
            className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg btn-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5 mr-2" />
        {t("product.addProduct")}
      </Button>
    </form>
  );
}
