package test

import (
	"testing"

	"product-management-app/core/dto"
)

func TestOptimizedDTOs(t *testing.T) {
	importDTO := dto.NewProductImportDTO(
		"Test Product",
		99.99,
		"Test Category",
		10,
		"Test description",
		"https://example.com/image.jpg",
	)

	createDTO := importDTO.ToCreateProductDTO()

	if createDTO.Name != "Test Product" {
		t.Errorf("Incorrect name: expected 'Test Product', got '%s'", createDTO.Name)
	}

	if createDTO.Price != 99.99 {
		t.Errorf("Incorrect price: expected 99.99, got %f", createDTO.Price)
	}

	if createDTO.Stock != 10 {
		t.Errorf("Incorrect stock: expected 10, got %d", createDTO.Stock)
	}

	if importDTO.CreateProductDTO.Name != createDTO.Name {
		t.Error("ProductImportDTO is not reusing CreateProductDTO correctly")
	}
}
