package dto

import "product-management-app/core/models"

type ImportResult struct {
	SuccessCount   int                  `json:"successCount"`
	ErrorCount     int                  `json:"errorCount"`
	Errors         []ImportError        `json:"errors,omitempty"`
	ImportedItems  []*models.Product    `json:"importedItems,omitempty"`
}

type ImportError struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value"`
}

type ExportFormat string

const (
	FormatCSV  ExportFormat = "csv"
	FormatXLSX ExportFormat = "xlsx"
)

type ExportRequest struct {
	Format     ExportFormat `json:"format"`
	IncludeAll bool         `json:"includeAll"`
	ProductIDs []int        `json:"productIds,omitempty"`
}

type ProductImportDTO struct {
	CreateProductDTO
}

func (p *ProductImportDTO) ToCreateProductDTO() CreateProductDTO {
	return p.CreateProductDTO
}

func NewProductImportDTO(name string, price float64, category string, stock int, description string, imageURL string) *ProductImportDTO {
	return &ProductImportDTO{
		CreateProductDTO: CreateProductDTO{
			Name:        name,
			Price:       price,
			Category:    category,
			Stock:       stock,
			Description: description,
			ImageURL:    imageURL,
		},
	}
}

type ProductExportDTO struct {
	ID          int     `json:"id" csv:"id"`
	Name        string  `json:"name" csv:"name"`
	Price       float64 `json:"price" csv:"price"`
	Category    string  `json:"category" csv:"category"`
	Stock       int     `json:"stock" csv:"stock"`
	Description string  `json:"description" csv:"description"`
	ImageURL    string  `json:"imageUrl" csv:"image_url"`
	CreatedAt   string  `json:"createdAt" csv:"created_at"`
	UpdatedAt   string  `json:"updatedAt" csv:"updated_at"`
}

func NewProductExportDTO(product *models.Product) *ProductExportDTO {
	dto := &ProductExportDTO{
		ID:        product.ID,
		Name:      product.Name,
		Price:     product.Price,
		Stock:     product.Stock,
		CreatedAt: product.CreatedAt,
	}
	
	if product.Category != nil {
		dto.Category = *product.Category
	}
	
	if product.Description != nil {
		dto.Description = *product.Description
	}
	
	if product.ImageURL != nil {
		dto.ImageURL = *product.ImageURL
	}
	
	if product.UpdatedAt != nil {
		dto.UpdatedAt = *product.UpdatedAt
	}
	
	return dto
}
