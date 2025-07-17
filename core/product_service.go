package core

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"product-management-app/core/dto"
	"product-management-app/core/models"
	"product-management-app/core/repositories"
)

type ProductService struct {
	repo *repositories.ProductRepository
	ctx  context.Context
	db   *DatabaseService
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
	return nil
}

func (s *ProductService) CloseDatabase() {
	if s.db != nil {
		s.db.CloseDatabase()
	}
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
