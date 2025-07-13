import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { core } from "wailsjs/go/models";
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertCircle,
} from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import { PriceInput } from "./PriceInput";
import { DatabaseStatus } from "./DatabaseStatus";

import {
  CreateProduct,
  GetAllProducts,
  UpdateProduct,
  DeleteProduct,
} from "../../wailsjs/go/main/App";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Product = core.Product;

export function ProductList() {
  const { t } = useTranslation();
  const { formatCurrency, convertFromBRL } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDatabaseHealthy, setIsDatabaseHealthy] = useState(true);
  const [error, setError] = useState<string>("");

  const loadProducts = useCallback(async () => {
    try {
      setError("");
      const result = await GetAllProducts();
      setProducts(result || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      console.error(t("errors.loadProducts"), error);
    }
  }, [t]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async () => {
    if (newProductName && newProductPrice > 0) {
      try {
        setError("");
        await CreateProduct(newProductName, newProductPrice);
        setNewProductName("");
        setNewProductPrice(0);
        void loadProducts();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        console.error(t("errors.createProduct"), error);
      }
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      try {
        setError("");
        await UpdateProduct(
          editingProduct.id,
          editingProduct.name,
          editingProduct.price
        );
        setEditingProduct(null);
        void loadProducts();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        console.error(t("errors.updateProduct"), error);
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      setError("");
      await DeleteProduct(id);
      void loadProducts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      console.error(t("errors.deleteProduct"), error);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Database Status */}
      <DatabaseStatus onStatusChange={setIsDatabaseHealthy} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={16} />
            <span className="font-medium">Erro</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* add product card*/}
      <div className="glass-card-white rounded-2xl p-8 hover-scale">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {t("product.addNew")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              placeholder={t("product.namePlaceholder")}
              className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="productPrice"
              className="text-sm font-medium text-gray-700"
            >
              {t("product.price")} (BRL)
            </Label>
            <PriceInput
              id="productPrice"
              value={newProductPrice}
              onChange={setNewProductPrice}
              placeholder={t("product.pricePlaceholder")}
              className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-gray-500 italic">
              💡 {t("product.priceNote")}
            </p>
          </div>

          <Button
            onClick={() => void handleCreateProduct()}
            disabled={!isDatabaseHealthy}
            className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg btn-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("product.addProduct")}
          </Button>
        </div>
      </div>

      {/* products list card */}
      <div className="glass-card-white rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {t("product.productList")}
              </h2>
              <p className="text-gray-600">
                {t("product.totalProducts", { count: products.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    {t("product.productName")}
                  </div>
                </TableHead>
                <TableHead className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  {t("product.price")}
                </TableHead>
                <TableHead className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  {t("actions.edit")} / {t("actions.delete")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Package className="w-12 h-12 text-gray-400" />
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
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {product.id}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
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
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-lg font-semibold rounded-full">
                        {formatCurrency(convertFromBRL(product.price))}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        {/* edit dialog */}
                        <Dialog>
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
                                  value={editingProduct?.name || ""}
                                  onChange={e =>
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
                                <PriceInput
                                  id="editPrice"
                                  value={editingProduct?.price || 0}
                                  onChange={value =>
                                    setEditingProduct(prev =>
                                      prev ? { ...prev, price: value } : null
                                    )
                                  }
                                  className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 italic">
                                  💡 {t("dialog.editPriceNote")}
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={() => void handleUpdateProduct()}
                                disabled={!isDatabaseHealthy}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12 px-8 rounded-lg btn-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                {t("actions.save")}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDeleteProduct(product.id)}
                          disabled={!isDatabaseHealthy}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold border-0 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t("actions.delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
