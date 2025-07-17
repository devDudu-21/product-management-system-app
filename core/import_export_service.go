package core

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"strconv"
	"strings"

	"product-management-app/core/dto"
	"product-management-app/core/models"
	"product-management-app/core/repositories"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
)

type ImportExportService struct {
	productRepo *repositories.ProductRepository
	ctx         context.Context
}

func NewImportExportService(productRepo *repositories.ProductRepository, ctx context.Context) *ImportExportService {
	return &ImportExportService{
		productRepo: productRepo,
		ctx:         ctx,
	}
}

func (s *ImportExportService) ExportToCSV(request dto.ExportRequest) ([]byte, error) {
	products, err := s.getProductsForExport(request)
	if err != nil {
		return nil, fmt.Errorf("failed to get products for export: %w", err)
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	headers := []string{"ID", "Nome", "Preço", "Categoria", "Estoque", "Descrição", "URL da Imagem", "Criado em", "Atualizado em"}
	if err := writer.Write(headers); err != nil {
		return nil, fmt.Errorf("failed to write CSV header: %w", err)
	}

	for _, product := range products {
		exportDTO := dto.NewProductExportDTO(product)
		record := []string{
			strconv.Itoa(exportDTO.ID),
			exportDTO.Name,
			strconv.FormatFloat(exportDTO.Price, 'f', 2, 64),
			exportDTO.Category,
			strconv.Itoa(exportDTO.Stock),
			exportDTO.Description,
			exportDTO.ImageURL,
			exportDTO.CreatedAt,
			exportDTO.UpdatedAt,
		}
		if err := writer.Write(record); err != nil {
			return nil, fmt.Errorf("failed to write CSV record: %w", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, fmt.Errorf("CSV writer error: %w", err)
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("Exported %d products to CSV", len(products)))
	return buf.Bytes(), nil
}

func (s *ImportExportService) ExportToXLSX(request dto.ExportRequest) ([]byte, error) {
	products, err := s.getProductsForExport(request)
	if err != nil {
		return nil, fmt.Errorf("failed to get products for export: %w", err)
	}

	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			runtime.LogError(s.ctx, fmt.Sprintf("Failed to close XLSX file: %v", err))
		}
	}()

	sheetName := "Produtos"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return nil, fmt.Errorf("failed to create sheet: %w", err)
	}

	headers := []string{"ID", "Nome", "Preço", "Categoria", "Estoque", "Descrição", "URL da Imagem", "Criado em", "Atualizado em"}
	for i, header := range headers {
		cell := fmt.Sprintf("%s1", string(rune('A'+i)))
		f.SetCellValue(sheetName, cell, header)
	}

	for rowIndex, product := range products {
		exportDTO := dto.NewProductExportDTO(product)
		row := rowIndex + 2 

		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), exportDTO.ID)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), exportDTO.Name)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), exportDTO.Price)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), exportDTO.Category)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), exportDTO.Stock)
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), exportDTO.Description)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", row), exportDTO.ImageURL)
		f.SetCellValue(sheetName, fmt.Sprintf("H%d", row), exportDTO.CreatedAt)
		f.SetCellValue(sheetName, fmt.Sprintf("I%d", row), exportDTO.UpdatedAt)
	}

	f.SetActiveSheet(index)
	f.DeleteSheet("Sheet1") 

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, fmt.Errorf("failed to write XLSX: %w", err)
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("Exported %d products to XLSX", len(products)))
	return buf.Bytes(), nil
}

func (s *ImportExportService) ImportFromCSV(data []byte) (*dto.ImportResult, error) {
	reader := csv.NewReader(bytes.NewReader(data))
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV: %w", err)
	}

	if len(records) < 2 {
		return &dto.ImportResult{
			SuccessCount: 0,
			ErrorCount:   1,
			Errors: []dto.ImportError{
				{Row: 0, Message: "Arquivo CSV está vazio ou contém apenas cabeçalhos"},
			},
		}, nil
	}

	result := &dto.ImportResult{
		ImportedItems: []*models.Product{},
		Errors:        []dto.ImportError{},
	}

	for i, record := range records[1:] {
		rowNum := i + 2 

		productDTO, errs := s.parseCSVRecord(record, rowNum)
		if len(errs) > 0 {
			result.Errors = append(result.Errors, errs...)
			result.ErrorCount++
			continue
		}

		createDTO := productDTO.ToCreateProductDTO()
		product, err := s.productRepo.Create(createDTO)
		if err != nil {
			result.Errors = append(result.Errors, dto.ImportError{
				Row:     rowNum,
				Message: fmt.Sprintf("Erro ao criar produto: %v", err),
			})
			result.ErrorCount++
			continue
		}

		result.ImportedItems = append(result.ImportedItems, product)
		result.SuccessCount++
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("Import completed: %d success, %d errors", result.SuccessCount, result.ErrorCount))
	return result, nil
}

func (s *ImportExportService) ImportFromXLSX(data []byte) (*dto.ImportResult, error) {
	f, err := excelize.OpenReader(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to open XLSX: %w", err)
	}
	defer func() {
		if err := f.Close(); err != nil {
			runtime.LogError(s.ctx, fmt.Sprintf("Failed to close XLSX file: %v", err))
		}
	}()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return &dto.ImportResult{
			SuccessCount: 0,
			ErrorCount:   1,
			Errors: []dto.ImportError{
				{Row: 0, Message: "Arquivo XLSX não contém planilhas"},
			},
		}, nil
	}

	sheetName := sheets[0] 
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("failed to get rows: %w", err)
	}

	if len(rows) < 2 {
		return &dto.ImportResult{
			SuccessCount: 0,
			ErrorCount:   1,
			Errors: []dto.ImportError{
				{Row: 0, Message: "Arquivo XLSX está vazio ou contém apenas cabeçalhos"},
			},
		}, nil
	}

	result := &dto.ImportResult{
		ImportedItems: []*models.Product{},
		Errors:        []dto.ImportError{},
	}

	for i, row := range rows[1:] {
		rowNum := i + 2 

		productDTO, errs := s.parseXLSXRow(row, rowNum)
		if len(errs) > 0 {
			result.Errors = append(result.Errors, errs...)
			result.ErrorCount++
			continue
		}

		createDTO := productDTO.ToCreateProductDTO()
		product, err := s.productRepo.Create(createDTO)
		if err != nil {
			result.Errors = append(result.Errors, dto.ImportError{
				Row:     rowNum,
				Message: fmt.Sprintf("Erro ao criar produto: %v", err),
			})
			result.ErrorCount++
			continue
		}

		result.ImportedItems = append(result.ImportedItems, product)
		result.SuccessCount++
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("Import completed: %d success, %d errors", result.SuccessCount, result.ErrorCount))
	return result, nil
}

func (s *ImportExportService) getProductsForExport(request dto.ExportRequest) ([]*models.Product, error) {
	if request.IncludeAll {
		pagination := dto.PaginationDTO{Page: 1, PageSize: 10000} 
		response, err := s.productRepo.GetAll(pagination)
		if err != nil {
			return nil, err
		}
		return response.Products, nil
	}

	var products []*models.Product
	for _, id := range request.ProductIDs {
		product, err := s.productRepo.GetByID(id)
		if err != nil {
			runtime.LogWarning(s.ctx, fmt.Sprintf("Failed to get product with ID %d: %v", id, err))
			continue
		}
		products = append(products, product)
	}

	return products, nil
}

func (s *ImportExportService) parseCSVRecord(record []string, rowNum int) (*dto.ProductImportDTO, []dto.ImportError) {
	var errors []dto.ImportError

	if len(record) < 6 {
		errors = append(errors, dto.ImportError{
			Row:     rowNum,
			Message: "Registro incompleto, esperado pelo menos 6 campos",
		})
		return nil, errors
	}

	name := strings.TrimSpace(record[0])
	if name == "" {
		errors = append(errors, dto.ImportError{
			Row:     rowNum,
			Field:   "name",
			Message: "Nome é obrigatório",
			Value:   record[0],
		})
	}

	price, err := strconv.ParseFloat(strings.TrimSpace(record[1]), 64)
	if err != nil {
		errors = append(errors, dto.ImportError{
			Row:     rowNum,
			Field:   "price",
			Message: "Preço deve ser um número válido",
			Value:   record[1],
		})
	} else if price < 0 {
		errors = append(errors, dto.ImportError{
			Row:     rowNum,
			Field:   "price",
			Message: "Preço deve ser positivo",
			Value:   record[1],
		})
	}

	category := strings.TrimSpace(record[2])

	stock, err := strconv.Atoi(strings.TrimSpace(record[3]))
	if err != nil {
		errors = append(errors, dto.ImportError{
			Row:     rowNum,
			Field:   "stock",
			Message: "Estoque deve ser um número inteiro válido",
			Value:   record[3],
		})
	} else if stock < 0 {
		errors = append(errors, dto.ImportError{
			Row:     rowNum,
			Field:   "stock",
			Message: "Estoque deve ser não negativo",
			Value:   record[3],
		})
	}

	description := ""
	if len(record) > 4 {
		description = strings.TrimSpace(record[4])
	}

	imageURL := ""
	if len(record) > 5 {
		imageURL = strings.TrimSpace(record[5])
	}

	if len(errors) > 0 {
		return nil, errors
	}

	return dto.NewProductImportDTO(name, price, category, stock, description, imageURL), nil
}

func (s *ImportExportService) parseXLSXRow(row []string, rowNum int) (*dto.ProductImportDTO, []dto.ImportError) {
	record := make([]string, 6)
	for i := 0; i < len(record) && i < len(row); i++ {
		record[i] = row[i]
	}
	return s.parseCSVRecord(record, rowNum)
}
