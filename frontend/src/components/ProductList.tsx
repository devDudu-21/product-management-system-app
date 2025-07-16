import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Package, Search } from "lucide-react";
import { DatabaseStatus } from "./DatabaseStatus";
import { useProductList } from "../hooks/useProductList";
import { AddProductForm } from "./product/AddProductForm";
import { ProductTable } from "./product/ProductTable";
import { ProductPagination } from "./product/ProductPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { TooltipProvider } from "./ui/tooltip";

export function ProductList() {
  const { t } = useTranslation();
  const {
    products,
    totalCount,
    totalPages,
    paginationParams,
    setPaginationParams,
    error,
    isDatabaseHealthy,
    setIsDatabaseHealthy,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  } = useProductList({
    page: 1,
    pageSize: 10,
    search: "",
    sortBy: "id",
    order: "asc",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Busca e ordenação
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const newTimeout = setTimeout(() => {
      setPaginationParams({ search: value, page: 1 });
    }, 500);
    setSearchTimeout(newTimeout as unknown as number);
  };

  const handleSortChange = (field: string) => {
    const newOrder =
      paginationParams.sortBy === field && paginationParams.order === "asc"
        ? "desc"
        : "asc";
    setPaginationParams({ sortBy: field, order: newOrder, page: 1 });
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
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
              {/* Ícone de adicionar */}
              <span className="w-6 h-6 text-white">+</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {t("product.addNew")}
            </h2>
          </div>
          <AddProductForm
            onAdd={handleCreateProduct}
            disabled={!isDatabaseHealthy}
          />
        </div>

        {/* products list card */}
        <div className="glass-card-white rounded-2xl overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {t("product.productList")}
                  </h2>
                  <p className="text-gray-600">
                    {t("product.totalProducts", { count: totalCount })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={t("product.searchPlaceholder")}
                    value={searchTerm}
                    onChange={e => handleSearchChange(e.target.value)}
                    className="pl-10 w-64 h-10 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  />
                </div>
                <Select
                  value={`${paginationParams.sortBy}-${paginationParams.order}`}
                  onValueChange={value => {
                    const [sortBy, order] = value.split("-");
                    setPaginationParams({
                      sortBy,
                      order: order as "asc" | "desc",
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger className="w-48 h-10 border-2 border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder={t("product.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id-asc">
                      {t("product.sortById")} (A-Z)
                    </SelectItem>
                    <SelectItem value="id-desc">
                      {t("product.sortById")} (Z-A)
                    </SelectItem>
                    <SelectItem value="name-asc">
                      {t("product.sortByName")} (A-Z)
                    </SelectItem>
                    <SelectItem value="name-desc">
                      {t("product.sortByName")} (Z-A)
                    </SelectItem>
                    <SelectItem value="price-asc">
                      {t("product.sortByPrice")} (Menor)
                    </SelectItem>
                    <SelectItem value="price-desc">
                      {t("product.sortByPrice")} (Maior)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("id")}
                  >
                    ID
                  </th>
                  <th
                    className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("name")}
                  >
                    {t("product.productName")}
                  </th>
                  <th
                    className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange("price")}
                  >
                    {t("product.price")}
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {t("actions.edit")} / {t("actions.delete")}
                  </th>
                </tr>
              </thead>
              <ProductTable
                products={products}
                onEdit={handleUpdateProduct}
                onDelete={handleDeleteProduct}
                isDatabaseHealthy={isDatabaseHealthy}
              />
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center pb-4">
              <ProductPagination
                currentPage={paginationParams.page}
                totalPages={totalPages}
                onPageChange={page => setPaginationParams({ page })}
              />
            </div>
          )}
          {totalPages > 0 && (
            <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-2 md:gap-0">
                <p>
                  {t("pagination.showing", {
                    start:
                      (paginationParams.page - 1) * paginationParams.pageSize +
                      1,
                    end: Math.min(
                      paginationParams.page * paginationParams.pageSize,
                      totalCount
                    ),
                    total: totalCount,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="ml-2">
                    {t("pagination.itemsPerPage", "Itens por página:")}
                  </label>
                  <select
                    id="pageSize"
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={paginationParams.pageSize}
                    onChange={e =>
                      setPaginationParams({
                        pageSize: Number(e.target.value),
                        page: 1,
                      })
                    }
                  >
                    {[5, 10, 20, 50, 100].map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
