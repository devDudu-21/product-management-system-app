import { useState, useCallback, useEffect } from "react";
import { models, dto } from "../../wailsjs/go/models";
import {
  CreateProduct,
  GetAllProducts,
  UpdateProduct,
  DeleteProduct,
} from "../../wailsjs/go/main/App";

export type Product = models.Product;
export type CreateProductDTO = dto.CreateProductDTO;

export interface PaginationParams {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  order: "asc" | "desc";
}

export function useProductList(initialParams: PaginationParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationParams, setPaginationParams] = useState(initialParams);
  const [error, setError] = useState<string>("");
  const [isDatabaseHealthy, setIsDatabaseHealthy] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setError("");
      const result = await GetAllProducts(paginationParams);
      setProducts(result.products || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(result.totalPages || 0);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }, [paginationParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handlePaginationChange = useCallback(
    (newParams: Partial<PaginationParams>) => {
      setPaginationParams(prev => ({ ...prev, ...newParams }));
    },
    []
  );

  const handleCreateProduct = async (productData: CreateProductDTO) => {
    if (productData.name && productData.price > 0) {
      try {
        setError("");
        await CreateProduct(productData);
        setPaginationParams(prev => ({ ...prev, page: 1 }));
        loadProducts();
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
      }
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      setError("");
      await UpdateProduct(product.id, product.name, product.price);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      setError("");
      await DeleteProduct(id);
      if (products.length === 1 && paginationParams.page > 1) {
        setPaginationParams(prev => ({ ...prev, page: prev.page - 1 }));
      }
      loadProducts();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return {
    products,
    totalCount,
    totalPages,
    paginationParams,
    setPaginationParams: handlePaginationChange,
    error,
    setError,
    isDatabaseHealthy,
    setIsDatabaseHealthy,
    editingProduct,
    setEditingProduct,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    reloadProducts: loadProducts,
  };
}
