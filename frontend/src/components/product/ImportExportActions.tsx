import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Product {
  id: number;
  name: string;
  price: number;
  category?: string;
  stock: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface ImportResultData {
  successCount: number;
  errorCount: number;
  errors?: ImportError[];
  importedItems?: Product[];
}

interface ImportExportActionsProps {
  products: Product[];
  onImportSuccess: () => void;
  disabled?: boolean;
}

interface ImportResult {
  success: boolean;
  data?: ImportResultData;
  message: string;
}

export function ImportExportActions({
  products,
  onImportSuccess,
  disabled = false,
}: ImportExportActionsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );
  const [exportAll, setExportAll] = useState(true);

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      const { SaveImportTemplate } = await import(
        "../../../wailsjs/go/main/App"
      );

      await SaveImportTemplate();

      setImportResult({
        success: true,
        message: t(
          "importExport.templateDownloaded",
          "Template salvo com sucesso!"
        ),
      });
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      setImportResult({
        success: false,
        message: `Erro ao salvar template: ${error}`,
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx");

      if (isCSV || isExcel) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        setImportResult({
          success: false,
          message: t("importExport.invalidFileType"),
        });
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportResult({
        success: false,
        message: t("importExport.fileRequired"),
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const { ImportProductsFromCSV, ImportProductsFromXLSX } = await import(
        "../../../wailsjs/go/main/App"
      );

      let result: ImportResultData;

      if (selectedFile.name.endsWith(".csv")) {
        const fileContent = await readFileAsText(selectedFile);
        result = await ImportProductsFromCSV(fileContent);
      } else {
        const fileContent = await readFileAsBase64(selectedFile);
        result = await ImportProductsFromXLSX(fileContent);
      }

      setImportResult({
        success: result.errorCount === 0,
        data: result,
        message:
          result.errorCount === 0
            ? t("importExport.importSuccess", { count: result.successCount })
            : t("importExport.importErrors", { count: result.errorCount }),
      });

      if (result.successCount > 0) {
        onImportSuccess();
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        message: `Import error: ${error}`,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        // Remove the data URL prefix to get just the base64 content
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);

    try {
      const { SaveExportedCSV, SaveExportedXLSX } = await import(
        "../../../wailsjs/go/main/App"
      );

      const productIds = exportAll ? [] : Array.from(selectedProducts);

      if (format === "csv") {
        await SaveExportedCSV(exportAll, productIds);
      } else {
        await SaveExportedXLSX(exportAll, productIds);
      }

      setImportResult({
        success: true,
        message: t(
          "importExport.exportSuccess",
          "Produtos exportados com sucesso!"
        ),
      });

      setExportDialogOpen(false);
    } catch (error) {
      console.error("Erro na exportação:", error);

      const errorMessage = String(error);
      if (
        errorMessage.includes("cancelada pelo usuário") ||
        errorMessage.includes("canceled")
      ) {
        setImportResult(null);
      } else {
        setImportResult({
          success: false,
          message: `Erro na exportação: ${error}`,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const toggleProductSelection = (productId: number) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t("importExport.import")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("importExport.importProducts")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t("importExport.saveTemplate", "Salvar Template")}
              </Button>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 file-upload-area"
              >
                <FileText className="w-4 h-4" />
                {selectedFile
                  ? selectedFile.name
                  : t("importExport.selectFile")}
              </Button>
            </div>

            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="w-full flex items-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isImporting
                ? t("importExport.importInProgress")
                : t("importExport.uploadFile")}
            </Button>

            {importResult && (
              <div
                className={`p-3 rounded-md ${
                  importResult.success
                    ? "bg-green-50 border border-green-200 import-result-success"
                    : "bg-red-50 border border-red-200 import-result-error"
                }`}
              >
                <div className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      importResult.success ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {importResult.message}
                  </span>
                </div>

                {importResult.data?.errors &&
                  importResult.data.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {importResult.data.errors
                        .slice(0, 5)
                        .map((error: ImportError, index: number) => (
                          <div key={index} className="text-xs text-red-600">
                            {t("importExport.importErrorDetails", {
                              row: error.row,
                              field: error.field,
                              message: error.message,
                            })}
                          </div>
                        ))}
                      {importResult.data.errors.length > 5 && (
                        <div className="text-xs text-red-600">
                          ... e mais {importResult.data.errors.length - 5}{" "}
                          erro(s)
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || products.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t("importExport.export")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("importExport.exportProducts")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="exportAll"
                  checked={exportAll}
                  onChange={() => setExportAll(true)}
                />
                <label htmlFor="exportAll" className="text-sm font-medium">
                  {t("importExport.exportAll")} ({products.length} produtos)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="exportSelected"
                  checked={!exportAll}
                  onChange={() => setExportAll(false)}
                />
                <label htmlFor="exportSelected" className="text-sm font-medium">
                  {t("importExport.exportSelected")} ({selectedProducts.size}{" "}
                  selecionados)
                </label>
              </div>
            </div>

            {!exportAll && (
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm"
                  >
                    {selectedProducts.size === products.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Selecionar todos
                  </button>
                </div>

                <div className="space-y-1">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleProductSelection(product.id)}
                        className="flex items-center gap-2 text-sm hover:bg-gray-50 w-full p-1 rounded product-selection-item"
                      >
                        {selectedProducts.has(product.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        <span className="truncate">{product.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleExport("csv")}
                disabled={
                  isExporting || (!exportAll && selectedProducts.size === 0)
                }
                className="flex-1 flex items-center gap-2 import-export-button"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {t("importExport.csvFormat")}
              </Button>

              <Button
                onClick={() => handleExport("xlsx")}
                disabled={
                  isExporting || (!exportAll && selectedProducts.size === 0)
                }
                className="flex-1 flex items-center gap-2 import-export-button"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                {t("importExport.xlsxFormat")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
