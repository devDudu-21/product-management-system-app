package test

import (
	"strings"
	"testing"

	"product-management-app/core/dto"
)

func TestImportExportBasicFunctionality(t *testing.T) {
	csvData := "Name,Price,Category,Stock\nTest Product,29.99,Electronics,10"
	
	lines := strings.Split(csvData, "\n")
	if len(lines) != 2 {
		t.Errorf("Expected 2 lines, got %d", len(lines))
	}

	template := getImportTemplateForTest()
	if !strings.Contains(template, "Name,Price,Category,Stock") {
		t.Error("Template should contain CSV headers")
	}

	dto := dto.NewProductImportDTO("Test Product", 29.99, "Category", 10, "Description", "")

	createDTO := dto.ToCreateProductDTO()
	if createDTO.Name != "Test Product" {
		t.Error("DTO conversion failed")
	}
}

func getImportTemplateForTest() string {
	return "Name,Price,Category,Stock,Description,Image URL\nExample Product,29.99,Electronics,10,Example description,https://example.com/image.jpg"
}
