import React, { useState, ChangeEvent } from "react";
import { Product } from "../../hooks/useProductList";
import { ShoppingBag, Edit, Trash2, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PriceInput } from "../PriceInput";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Accordion, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { ProductDetails } from "./ProductDetails";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  isDatabaseHealthy: boolean;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isDatabaseHealthy,
}: ProductTableProps) {
  const { t } = useTranslation();
  const { formatCurrency, convertFromBRL } = useCurrency();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null
  );

  const toggleProductDetails = (id: number) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  return (
    <tbody className="divide-y divide-gray-200">
      {products.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">
                  {t("product.noProducts")}
                </p>
                <p className="text-gray-500">
                  {t("product.noProductsSubtitle")}
                </p>
              </div>
            </div>
          </td>
        </tr>
      ) : (
        products.map((product, index) => (
          <React.Fragment key={product.id}>
            <tr
              className="hover:bg-gray-50 transition-colors duration-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <td className="px-8 py-6">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {product.id}
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-lg font-semibold rounded-full">
                  {formatCurrency(convertFromBRL(product.price))}
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProductDetails(product.id)}
                    className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        expandedProductId === product.id ? "rotate-180" : ""
                      }`}
                    />
                    {expandedProductId === product.id
                      ? t("actions.hideDetails")
                      : t("actions.viewDetails")}
                  </Button>

                  {/* edit dialog */}
                  <Dialog
                    open={!!editingProduct}
                    onOpenChange={open => !open && setEditingProduct(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        disabled={!isDatabaseHealthy}
                        className="flex items-center gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="w-4 h-4" />
                        {t("actions.edit")}
                      </Button>
                    </DialogTrigger>
                    {editingProduct && (
                      <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader className="space-y-4">
                          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Edit className="w-6 h-6 text-blue-600" />
                            </div>
                            {t("dialog.editProduct")}
                          </DialogTitle>
                          <DialogDescription className="text-gray-600">
                            {t("dialog.editDescription")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="editName"
                              className="text-sm font-medium text-gray-700"
                            >
                              {t("product.productName")}
                            </Label>
                            <Input
                              id="editName"
                              value={editingProduct.name}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setEditingProduct(prev =>
                                  prev
                                    ? { ...prev, name: e.target.value }
                                    : null
                                )
                              }
                              className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="editPrice"
                              className="text-sm font-medium text-gray-700"
                            >
                              {t("product.price")} (BRL)
                            </Label>
                            <div className="relative flex items-center gap-2">
                              <PriceInput
                                id="editPrice"
                                value={editingProduct.price}
                                onChange={value =>
                                  setEditingProduct(prev =>
                                    prev ? { ...prev, price: value } : null
                                  )
                                }
                                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-1 cursor-pointer p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                                    <svg
                                      width="16"
                                      height="16"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="#60a5fa"
                                      />
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
                                <TooltipContent className="bg-white border border-blue-200 text-gray-700 shadow-lg rounded-lg px-4 py-2 text-xs font-medium max-w-xs">
                                  {t("dialog.editPriceNote")}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() => {
                              if (editingProduct) {
                                onEdit(editingProduct);
                                setEditingProduct(null);
                              }
                            }}
                            disabled={!isDatabaseHealthy}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 px-8 rounded-lg btn-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {t("actions.save")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    disabled={!isDatabaseHealthy}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold border-0 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("actions.delete")}
                  </Button>
                </div>
              </td>
            </tr>
            {expandedProductId === product.id && (
              <tr>
                <td
                  colSpan={4}
                  className="px-8 py-6 bg-gray-50 animate-accordion-down"
                >
                  <Accordion defaultExpanded={true} className="border-0">
                    <AccordionTrigger className="hidden">
                      <span>Detalhes</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0">
                      <ProductDetails product={product} />
                    </AccordionContent>
                  </Accordion>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))
      )}
    </tbody>
  );
}
