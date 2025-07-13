package main

import (
	"context"
	"fmt"
	"log"
	"time"
	"wails-app/core" 
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
	
	// Tentativa de inicialização do banco com retry
	maxRetries := 3
	retryDelay := time.Second * 2
	
	for attempt := 1; attempt <= maxRetries; attempt++ {
		err := a.productService.InitDatabase()
		if err == nil {
			a.dbHealthy = true
			a.dbError = ""
			log.Printf("Banco de dados inicializado com sucesso na tentativa %d", attempt)
			return
		}
		
		log.Printf("Tentativa %d/%d de inicialização do banco falhou: %v", attempt, maxRetries, err)
		a.dbHealthy = false
		a.dbError = fmt.Sprintf("Falha na inicialização do banco de dados: %v", err)
		
		if attempt < maxRetries {
			log.Printf("Aguardando %v antes da próxima tentativa...", retryDelay)
			time.Sleep(retryDelay)
		}
	}
	
	// Se chegou aqui, todas as tentativas falharam
	log.Printf("ERRO CRÍTICO: Não foi possível inicializar o banco de dados após %d tentativas", maxRetries)
	log.Printf("A aplicação continuará, mas as operações de banco estarão indisponíveis")
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
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
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetDatabaseStatus retorna o status atual do banco de dados
func (a *App) GetDatabaseStatus() map[string]interface{} {
	return map[string]interface{}{
		"healthy": a.dbHealthy,
		"error":   a.dbError,
	}
}

// RetryDatabaseConnection tenta reconectar ao banco de dados
func (a *App) RetryDatabaseConnection() map[string]interface{} {
	log.Println("Tentando reconectar ao banco de dados...")
	
	err := a.productService.InitDatabase()
	if err != nil {
		a.dbHealthy = false
		a.dbError = fmt.Sprintf("Falha na reconexão: %v", err)
		log.Printf("Falha na reconexão: %v", err)
		return map[string]interface{}{
			"success": false,
			"error":   a.dbError,
		}
	}
	
	a.dbHealthy = true
	a.dbError = ""
	log.Println("Reconexão ao banco de dados bem-sucedida!")
	return map[string]interface{}{
		"success": true,
		"message": "Conexão com banco de dados restaurada com sucesso",
	}
}

// checkDatabaseHealth verifica se o banco está saudável antes de operações
func (a *App) checkDatabaseHealth() error {
	if !a.dbHealthy {
		return fmt.Errorf("banco de dados não está disponível: %s", a.dbError)
	}
	return nil
}

// CRUD methods to interact with ProductService
func (a *App) CreateProduct(name string, price float64) (*core.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		return nil, err
	}
	return a.productService.CreateProduct(name, price)
}

func (a *App) GetProduct(id int) (*core.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		return nil, err
	}
	return a.productService.GetProductByID(id)
}

func (a *App) GetAllProducts() ([]*core.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		return nil, err
	}
	return a.productService.GetAllProducts()
}

func (a *App) UpdateProduct(id int, name string, price float64) (*core.Product, error) {
	if err := a.checkDatabaseHealth(); err != nil {
		return nil, err
	}
	return a.productService.UpdateProduct(id, name, price)
}

func (a *App) DeleteProduct(id int) error {
	if err := a.checkDatabaseHealth(); err != nil {
		return err
	}
	return a.productService.DeleteProduct(id)
}
