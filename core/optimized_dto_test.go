package core

import (
	"testing"

	"product-management-app/core/dto"
)

func TestOptimizedDTOs(t *testing.T) {
	importDTO := dto.NewProductImportDTO(
		"Produto Teste",
		99.99,
		"Categoria Teste",
		10,
		"Descrição teste",
		"https://exemplo.com/imagem.jpg",
	)

	createDTO := importDTO.ToCreateProductDTO()
	
	if createDTO.Name != "Produto Teste" {
		t.Errorf("Nome incorreto: esperado 'Produto Teste', obtido '%s'", createDTO.Name)
	}
	
	if createDTO.Price != 99.99 {
		t.Errorf("Preço incorreto: esperado 99.99, obtido %f", createDTO.Price)
	}
	
	if createDTO.Stock != 10 {
		t.Errorf("Estoque incorreto: esperado 10, obtido %d", createDTO.Stock)
	}

	if importDTO.CreateProductDTO.Name != createDTO.Name {
		t.Error("ProductImportDTO não está reutilizando CreateProductDTO corretamente")
	}
}
