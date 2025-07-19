package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"time"

	"product-management-app/core/dto"
	"product-management-app/core/models"
	service "product-management-app/core/services"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx             context.Context
	productService  *service.ProductService
	currencyService *service.WailsCurrencyService
	dbHealthy       bool
	dbError         string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
	a.productService = service.NewProductService()
	a.productService.SetContext(ctx)

	// Initialize currency service
	a.currencyService = service.NewWailsCurrencyService(ctx)
	runtime.LogInfo(a.ctx, "Currency service initialized successfully")

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

	data, err := base64.StdEncoding.DecodeString(xlsxData)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to decode XLSX base64 data: %v", err))
		return nil, fmt.Errorf("invalid XLSX data format: %v", err)
	}

	return a.productService.ImportProductsFromXLSX(data)
}

func (a *App) GetImportTemplate() string {
	template := "Name,Price,Category,Stock,Description,Image URL\n"
	template += "Example Product,29.99,Electronics,10,Example product description,https://example.com/image.jpg\n"
	template += "Another Product,49.90,Home & Garden,5,Another example product,\n"

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

	filename := fmt.Sprintf("products_%s.csv", time.Now().Format("2006-01-02"))
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save CSV Export",
		DefaultFilename: filename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "CSV Files (*.csv)",
				Pattern:     "*.csv",
			},
		},
	})

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedCSV dialog error: %v", err))
		return err
	}

	if filePath == "" {
		return fmt.Errorf("operation cancelled by user")
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedCSV write error: %v", err))
		return fmt.Errorf("error saving file: %v", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("CSV exported successfully to: %s", filePath))
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

	filename := fmt.Sprintf("products_%s.xlsx", time.Now().Format("2006-01-02"))
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Excel Export",
		DefaultFilename: filename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel Files (*.xlsx)",
				Pattern:     "*.xlsx",
			},
		},
	})

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedXLSX dialog error: %v", err))
		return err
	}

	if filePath == "" {
		return fmt.Errorf("operation cancelled by user")
	}

	err = os.WriteFile(filePath, data, 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveExportedXLSX write error: %v", err))
		return fmt.Errorf("error saving file: %v", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("XLSX exported successfully to: %s", filePath))
	return nil
}

func (a *App) SaveImportTemplate() error {
	template := a.GetImportTemplate()

	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Import Template",
		DefaultFilename: "products_template.csv",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "CSV Files (*.csv)",
				Pattern:     "*.csv",
			},
		},
	})

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveImportTemplate dialog error: %v", err))
		return err
	}

	if filePath == "" {
		return fmt.Errorf("operation cancelled by user")
	}

	err = os.WriteFile(filePath, []byte(template), 0644)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("SaveImportTemplate write error: %v", err))
		return fmt.Errorf("error saving template: %v", err)
	}

	runtime.LogInfo(a.ctx, fmt.Sprintf("Template saved successfully to: %s", filePath))
	return nil
}

// ConvertCurrency converts an amount from one currency to another
func (a *App) ConvertCurrency(request dto.CurrencyConversionRequest) (*dto.CurrencyConversionResponse, error) {
	runtime.LogInfo(a.ctx, fmt.Sprintf("ConvertCurrency called: %.2f %s to %s", request.Amount, request.FromCurrency, request.ToCurrency))
	return a.currencyService.ConvertCurrency(request)
}

// GetSupportedCurrencies returns the list of supported currencies
func (a *App) GetSupportedCurrencies() *dto.SupportedCurrenciesResponse {
	runtime.LogInfo(a.ctx, "GetSupportedCurrencies called")
	return a.currencyService.GetSupportedCurrencies()
}

// GetExchangeRatesForCurrency returns all exchange rates for a base currency
func (a *App) GetExchangeRatesForCurrency(baseCurrency string) (*dto.CurrencyRatesResponse, error) {
	runtime.LogInfo(a.ctx, fmt.Sprintf("GetExchangeRatesForCurrency called for: %s", baseCurrency))
	return a.currencyService.GetExchangeRatesForCurrency(baseCurrency)
}

// ClearCurrencyCache clears the currency exchange rates cache
func (a *App) ClearCurrencyCache() {
	runtime.LogInfo(a.ctx, "ClearCurrencyCache called")
	a.currencyService.ClearCache()
}
