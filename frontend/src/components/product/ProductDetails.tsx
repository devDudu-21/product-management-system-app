import { Product } from "../../hooks/useProductList";
import { useTranslation } from "react-i18next";
import { Calendar, Box, Tag, FileText, Image } from "lucide-react";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {product.category && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("product.category")}
              </p>
              <p className="text-base font-semibold text-gray-800">
                {product.category}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
            <Box className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              {t("product.stock")}
            </p>
            <p className="text-base font-semibold text-gray-800">
              {product.stock}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("product.description")}
              </p>
              <p className="text-base font-medium text-gray-700">
                {product.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-500">
                {t("product.createdAt")}
              </p>
              <p className="text-base font-semibold text-gray-800">
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>

            {product.updatedAt && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("product.updatedAt")}
                </p>
                <p className="text-base font-semibold text-gray-800">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {product.imageUrl && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-100 rounded-lg flex-shrink-0">
              <Image className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("product.imageUrl")}
              </p>
              <div className="mt-2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-32 w-auto rounded-lg border border-gray-200 shadow-sm"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://placehold.co/600x400";
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
