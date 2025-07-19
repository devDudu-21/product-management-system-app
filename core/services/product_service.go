package service

import (
	"context"
	"fmt"

	"product-management-app/core/dto"
	"product-management-app/core/models"
	"product-management-app/core/repositories"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ProductService struct {
	repo                *repositories.ProductRepository
	ctx                 context.Context
	db                  *DatabaseService
	importExportService *ImportExportService
}

func (s *ProductService) SetContext(ctx context.Context) {
	s.ctx = ctx
	runtime.LogInfo(s.ctx, "Context set for ProductService")
}

func NewProductService() *ProductService {
	return &ProductService{}
}

func (s *ProductService) InitDatabase() error {
	s.db = NewDatabaseService(s.ctx)
	if err := s.db.InitDatabase(); err != nil {
		return err
	}
	s.repo = repositories.NewProductRepository(s.db.DB, s.ctx)
	s.importExportService = NewImportExportService(s.repo, s.ctx)
	return nil
}

func (s *ProductService) CloseDatabase() {
	if s.db != nil {
		s.db.CloseDatabase()
	}
}

func (s *ProductService) HealthCheck() error {
	if s.db != nil {
		return s.db.HealthCheck()
	}
	return fmt.Errorf("database service not initialized")
}

func (s *ProductService) CreateProduct(createProductDTO dto.CreateProductDTO) (*models.Product, error) {
	product, err := s.repo.Create(createProductDTO)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to create product: %v", err))
		return nil, err
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product created: %+v", product))
	return product, nil
}

func (s *ProductService) GetProductByID(id int) (*models.Product, error) {
	product, err := s.repo.GetByID(id)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to fetch product with ID %d: %v", id, err))
		return nil, err
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product found: %+v", product))
	return product, nil
}

func (s *ProductService) GetAllProducts(params dto.PaginationDTO) (*dto.PaginationResponse, error) {
	response, err := s.repo.GetAll(params)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to fetch products: %v", err))
		return nil, err
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Products found: %d of %d total", len(response.Products), response.TotalCount))
	return response, nil
}

func (s *ProductService) UpdateProduct(id int, name string, price float64) (*models.Product, error) {
	product, err := s.repo.Update(id, name, price)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to update product with ID %d: %v", id, err))
		return nil, err
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product updated: %+v", product))
	return product, nil
}

func (s *ProductService) DeleteProduct(id int) error {
	err := s.repo.Delete(id)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to delete product with ID %d: %v", id, err))
		return err
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product deleted: ID %d", id))
	return nil
}

func (s *ProductService) ExportProductsToCSV(includeAll bool, productIDs []int) ([]byte, error) {
	request := dto.ExportRequest{
		Format:     dto.FormatCSV,
		IncludeAll: includeAll,
		ProductIDs: productIDs,
	}

	data, err := s.importExportService.ExportToCSV(request)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to export products to CSV: %v", err))
		return nil, err
	}

	runtime.LogInfo(s.ctx, "Products exported to CSV successfully")
	return data, nil
}

func (s *ProductService) ExportProductsToXLSX(includeAll bool, productIDs []int) ([]byte, error) {
	request := dto.ExportRequest{
		Format:     dto.FormatXLSX,
		IncludeAll: includeAll,
		ProductIDs: productIDs,
	}

	data, err := s.importExportService.ExportToXLSX(request)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to export products to XLSX: %v", err))
		return nil, err
	}

	runtime.LogInfo(s.ctx, "Products exported to XLSX successfully")
	return data, nil
}

func (s *ProductService) ImportProductsFromCSV(data []byte) (*dto.ImportResult, error) {
	result, err := s.importExportService.ImportFromCSV(data)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to import products from CSV: %v", err))
		return nil, err
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("CSV import completed: %d success, %d errors", result.SuccessCount, result.ErrorCount))
	return result, nil
}

func (s *ProductService) ImportProductsFromXLSX(data []byte) (*dto.ImportResult, error) {
	result, err := s.importExportService.ImportFromXLSX(data)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to import products from XLSX: %v", err))
		return nil, err
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("XLSX import completed: %d success, %d errors", result.SuccessCount, result.ErrorCount))
	return result, nil
}
