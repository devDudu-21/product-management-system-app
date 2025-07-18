package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"product-management-app/core"
	"product-management-app/core/dto"
	"product-management-app/core/models"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx            context.Context
	productService *core.ProductService
	dbHealthy      bool
	dbError        string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	a.productService = core.NewProductService()
	a.productService.SetContext(ctx)

	maxRetries := 3
	retryDelay := time.Second * 2

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := a.productService.InitDatabase()
		if err == nil {
			a.dbHealthy = true
			a.dbError = ""
			runtime.LogInfo(a.ctx, fmt.Sprintf("Database initialized successfully on attempt %d", attempt))
			return
		}

		runtime.LogError(a.ctx, fmt.Sprintf("Database initialization attempt %d/%d failed: %v", attempt, maxRetries, err))
		a.dbHealthy = false
		a.dbError = fmt.Sprintf("Database initialization failed: %v", err)

		if attempt < maxRetries {
			runtime.LogInfo(a.ctx, fmt.Sprintf("Waiting %v before next attempt...", retryDelay))
			time.Sleep(retryDelay)
		}
	}

	runtime.LogFatal(a.ctx, fmt.Sprintf("CRITICAL ERROR: Could not initialize database after %d attempts", maxRetries))
	runtime.LogWarning(a.ctx, "Application will continue, but database operations will be unavailable")
}

func (a *App) onSecondInstanceLaunch(secondInstanceData options.SecondInstanceData) {
	runtime.WindowUnminimise(a.ctx)
	runtime.Show(a.ctx)
	go runtime.EventsEmit(a.ctx, "launchArgs", secondInstanceData.Args)
}

// domReady is called after front-end resources have been loaded
func (a *App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
	a.productService.CloseDatabase()
}

// Greet returns a greeting for the given name (método de exemplo do template)
func (a *App) Greet(name string) string {
	runtime.LogInfo(a.ctx, fmt.Sprintf("Greet method called with name: %s", name))
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetDatabaseStatus returns the current status of the database
func (a *App) GetDatabaseStatus() map[string]interface{} {
	return map[string]interface{}{
		"healthy": a.dbHealthy,
		"error":   a.dbError,
	}
}

// RetryDatabaseConnection tries to reconnect to the database
func (a *App) RetryDatabaseConnection() map[string]interface{} {
	runtime.LogInfo(a.ctx, "Trying to reconnect to database...")

	err := a.productService.InitDatabase()
	if err != nil {
		a.dbHealthy = false
		a.dbError = fmt.Sprintf("Reconnection failed: %v", err)
		runtime.LogError(a.ctx, fmt.Sprintf("Reconnection failed: %v", err))
		return map[string]interface{}{
			"success": false,
			"error":   a.dbError,
		}
	}

	a.dbHealthy = true
	a.dbError = ""
	runtime.LogInfo(a.ctx, "Database reconnection successful!")
	return map[string]interface{}{
		"success": true,
		"message": "Database connection restored successfully",
	}
}

// checkDatabaseHealth verifies if the database is healthy before operations
func (a *App) checkDatabaseHealth() error {
	if !a.dbHealthy {
		return fmt.Errorf("database is not available: %s", a.dbError)
	}
	return nil
}

// CRUD methods to interact with ProductService
func (a *App) CreateProduct(createProductDTO dto.CreateProductDTO) (*models.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("CreateProduct failed: %v", err))
		return nil, err
	}
	return a.productService.CreateProduct(createProductDTO)
}

func (a *App) GetProduct(id int) (*models.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("GetProduct failed: %v", err))
		return nil, err
	}
	return a.productService.GetProductByID(id)
}

func (a *App) GetAllProducts(params dto.PaginationDTO) (*dto.PaginationResponse, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("GetAllProducts failed: %v", err))
		return nil, err
	}
	return a.productService.GetAllProducts(params)
}

func (a *App) UpdateProduct(id int, name string, price float64) (*models.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("UpdateProduct failed: %v", err))
		return nil, err
	}
	return a.productService.UpdateProduct(id, name, price)
}

func (a *App) DeleteProduct(id int) error {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("DeleteProduct failed: %v", err))
		return err
	}
	return a.productService.DeleteProduct(id)
}


func (a *App) ExportProductsToCSV(includeAll bool, productIDs []int) (string, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("ExportProductsToCSV failed: %v", err))
		return "", err
	}
	
	data, err := a.productService.ExportProductsToCSV(includeAll, productIDs)
	if err != nil {
		return "", err
	}
	
	return string(data), nil
}

func (a *App) ExportProductsToXLSX(includeAll bool, productIDs []int) (string, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("ExportProductsToXLSX failed: %v", err))
		return "", err
	}
	
	data, err := a.productService.ExportProductsToXLSX(includeAll, productIDs)
	if err != nil {
		return "", err
	}
	
	return string(data), nil
}

func (a *App) ImportProductsFromCSV(csvData string) (*dto.ImportResult, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("ImportProductsFromCSV failed: %v", err))
		return nil, err
	}
	
	return a.productService.ImportProductsFromCSV([]byte(csvData))
}

func (a *App) ImportProductsFromXLSX(xlsxData string) (*dto.ImportResult, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("ImportProductsFromXLSX failed: %v", err))
		return nil, err
	}
	
	return a.productService.ImportProductsFromXLSX([]byte(xlsxData))
}

func (a *App) GetImportTemplate() string {
	template := "Nome,Preço,Categoria,Estoque,Descrição,URL da Imagem\n"
	template += "Produto Exemplo,29.99,Eletrônicos,10,Descrição do produto exemplo,https://exemplo.com/imagem.jpg\n"
	template += "Outro Produto,49.90,Casa e Jardim,5,Outro exemplo de produto,\n"
	
	return template
}

func (a *App) SaveExportedCSV(includeAll bool, productIDs []int) error {
	if !a.dbHealthy {
		runtime.LogError(a.ctx, "SaveExportedCSV failed: database not healthy")
		return fmt.Errorf("database connection is not healthy")
	}

	data, err := a.productService.ExportProductsToCSV(includeAll, productIDs)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedCSV failed to generate data: %v", err))
		return err
	}

	filename := fmt.Sprintf("produtos_%s.csv", time.Now().Format("2006-01-02"))
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Salvar Exportação CSV",
		DefaultFilename: filename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Arquivos CSV (*.csv)",
				Pattern:     "*.csv",
			},
		},
	})

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedCSV dialog error: %v", err))
		return err
	}

	if filePath == "" {
		return fmt.Errorf("operação cancelada pelo usuário")
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedCSV write error: %v", err))
		return fmt.Errorf("erro ao salvar arquivo: %v", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("CSV exportado com sucesso para: %s", filePath))
	return nil
}

func (a *App) SaveExportedXLSX(includeAll bool, productIDs []int) error {
	if !a.dbHealthy {
		runtime.LogError(a.ctx, "SaveExportedXLSX failed: database not healthy")
		return fmt.Errorf("database connection is not healthy")
	}

	data, err := a.productService.ExportProductsToXLSX(includeAll, productIDs)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedXLSX failed to generate data: %v", err))
		return err
	}

	filename := fmt.Sprintf("produtos_%s.xlsx", time.Now().Format("2006-01-02"))
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Salvar Exportação Excel",
		DefaultFilename: filename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Arquivos Excel (*.xlsx)",
				Pattern:     "*.xlsx",
			},
		},
	})

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedXLSX dialog error: %v", err))
		return err
	}

	if filePath == "" {
		return fmt.Errorf("operação cancelada pelo usuário")
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedXLSX write error: %v", err))
		return fmt.Errorf("erro ao salvar arquivo: %v", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("XLSX exportado com sucesso para: %s", filePath))
	return nil
}

func (a *App) SaveImportTemplate() error {
	template := a.GetImportTemplate()

	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Salvar Template de Importação",
		DefaultFilename: "template_produtos.csv",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Arquivos CSV (*.csv)",
				Pattern:     "*.csv",
			},
		},
	})

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveImportTemplate dialog error: %v", err))
		return err
	}

	if filePath == "" {
		return fmt.Errorf("operação cancelada pelo usuário")
	}

	err = os.WriteFile(filePath, []byte(template), 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveImportTemplate write error: %v", err))
		return fmt.Errorf("erro ao salvar template: %v", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("Template salvo com sucesso em: %s", filePath))
	return nil
}
