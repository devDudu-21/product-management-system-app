package main

import (
	"context"
	"fmt"
	"wails-app/core" 
)

// App struct
type App struct {
	ctx            context.Context
	productService *core.ProductService
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
	if err := a.productService.InitDatabase(); err != nil {
		// Em caso de erro na inicialização do DB, é crucial logar e possivelmente encerrar a aplicação.
		// runtime.Quit(ctx) ou log.Fatal(err) são opções, dependendo da sua estratégia de erro.
		fmt.Printf("Erro ao inicializar o banco de dados: %v\n", err)
		// Para este exemplo, vamos permitir que a aplicação continue, mas as operações de DB falharão.
		// Em uma aplicação real, você provavelmente iria encerrar.
	}
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

// CRUD methods to interact with ProductService
func (a *App) CreateProduct(name string, price float64) (*core.Product, error) {
	return a.productService.CreateProduct(name, price)
}

func (a *App) GetProduct(id int) (*core.Product, error) {
	return a.productService.GetProductByID(id)
}

func (a *App) GetAllProducts() ([]*core.Product, error) {
	return a.productService.GetAllProducts()
}

func (a *App) UpdateProduct(id int, name string, price float64) (*core.Product, error) {
	return a.productService.UpdateProduct(id, name, price)
}

func (a *App) DeleteProduct(id int) error {
	return a.productService.DeleteProduct(id)
}
