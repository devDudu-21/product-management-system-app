package core

import (
	"strings"
	"testing"

	"product-management-app/core/dto"
)

func TestImportExportBasicFunctionality(t *testing.T) {
	csvData := "Nome,Preço,Categoria,Estoque\nProduto Teste,29.99,Eletrônicos,10"
	
	lines := strings.Split(csvData, "\n")
	if len(lines) != 2 {
		t.Errorf("Esperado 2 linhas, obtido %d", len(lines))
	}

	template := getImportTemplateForTest()
	if !strings.Contains(template, "Nome,Preço,Categoria,Estoque") {
		t.Error("Template deve conter cabeçalhos CSV")
	}

	dto := dto.NewProductImportDTO("Produto Teste", 29.99, "Categoria", 10, "Descrição", "")

	createDTO := dto.ToCreateProductDTO()
	if createDTO.Name != "Produto Teste" {
		t.Error("Conversão de DTO falhou")
	}
}

func getImportTemplateForTest() string {
	return "Nome,Preço,Categoria,Estoque,Descrição,URL da Imagem\nProduto Exemplo,29.99,Eletrônicos,10,Descrição exemplo,https://exemplo.com/imagem.jpg"
}
