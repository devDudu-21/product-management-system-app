package core

import (
	"context"
	"database/sql"
	"fmt"

	"product-management-app/core/dto"

	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ProductService struct {
	db  *sql.DB
	ctx context.Context
}

func (s *ProductService) SetContext(ctx context.Context) {
	s.ctx = ctx
	runtime.LogInfo(s.ctx, "Context set for ProductService")
}

func NewProductService() *ProductService {
	return &ProductService{}
}

func (s *ProductService) InitDatabase() error {
	var err error
	s.db, err = sql.Open("sqlite3", "./database.db")
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to open database: %v", err))
		return fmt.Errorf("failed to open database: %w", err)
	}
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		price REAL NOT NULL
	);`

	_, err = s.db.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("failed to create products table: %w", err)
	}
	runtime.LogInfo(s.ctx, "SQLite database and 'products' table initialized successfully!")
	return nil
}

func (s *ProductService) CloseDatabase() {
	if s.db != nil {
		s.db.Close()
		runtime.LogInfo(s.ctx, "Database connection closed.")
	}
}

// verify if the database connection is healthy
func (s *ProductService) HealthCheck() error {
	if s.db == nil {
		runtime.LogError(s.ctx, "Database connection not established")
		return fmt.Errorf("database connection not established")
	}

	// tries to ping the database to check if it's active
	if err := s.db.Ping(); err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Database connection is not healthy: %v", err))
		return fmt.Errorf("database connection is not healthy: %w", err)
	}

	runtime.LogInfo(s.ctx, "Database connection is healthy.")
	return nil
}

func (s *ProductService) CreateProduct(name string, price float64) (*Product, error) {
	res, err := s.db.Exec("INSERT INTO products(name, price) VALUES(?, ?)", name, price)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to create product: %v", err))
		return nil, fmt.Errorf("failed to create product: %w", err)
	}
	id, _ := res.LastInsertId()
	product := &Product{ID: int(id), Name: name, Price: price}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product created: %+v", product))
	return product, nil
}

func (s *ProductService) GetProductByID(id int) (*Product, error) {
	row := s.db.QueryRow("SELECT id, name, price FROM products WHERE id = ?", id)
	var product Product
	err := row.Scan(&product.ID, &product.Name, &product.Price)
	if err != nil {
		if err == sql.ErrNoRows {
			runtime.LogWarning(s.ctx, fmt.Sprintf("Product with ID %d not found", id))
			return nil, fmt.Errorf("product with ID %d not found", id)
		}
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to fetch product with ID %d: %v", id, err))
		return nil, fmt.Errorf("failed to fetch product: %w", err)
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product found: %+v", product))
	return &product, nil
}

func (s *ProductService) GetAllProducts(params pagination_dto.PaginationDTO) (*PaginationResponse, error) {

	baseQuery := "SELECT id, name, price FROM products"
	countQuery := "SELECT COUNT(*) FROM products"

	var whereClause string
	var args []interface{}

	if params.Search != "" {
		whereClause = " WHERE name LIKE ?"
		args = append(args, "%"+params.Search+"%")
	}

	var totalCount int
	err := s.db.QueryRow(countQuery+whereClause, args...).Scan(&totalCount)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to count products: %v", err))
		return nil, fmt.Errorf("failed to count products: %w", err)
	}

	totalPages := (totalCount + params.PageSize - 1) / params.PageSize

	query := baseQuery + whereClause

	orderBy := "id"
	if params.SortBy != "" {
		orderBy = params.SortBy
	}

	order := "ASC"
	if params.Order == "desc" {
		order = "DESC"
	}

	query += " ORDER BY " + orderBy + " " + order

	offset := (params.Page - 1) * params.PageSize
	query += " LIMIT ? OFFSET ?"
	args = append(args, params.PageSize, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to fetch products: %v", err))
		return nil, fmt.Errorf("failed to fetch products: %w", err)
	}
	defer rows.Close()

	var products []*Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Price); err != nil {
			runtime.LogError(s.ctx, fmt.Sprintf("Failed to scan product: %v", err))
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, &product)
	}

	response := &PaginationResponse{
		Products:   products,
		TotalCount: totalCount,
		TotalPages: totalPages,
		Page:       params.Page,
		PageSize:   params.PageSize,
	}

	runtime.LogInfo(s.ctx, fmt.Sprintf("Products found: %d of %d total", len(products), totalCount))
	return response, nil
}

func (s *ProductService) UpdateProduct(id int, name string, price float64) (*Product, error) {
	result, err := s.db.Exec("UPDATE products SET name = ?, price = ? WHERE id = ?", name, price, id)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to update product with ID %d: %v", id, err))
		return nil, fmt.Errorf("failed to update product: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		runtime.LogWarning(s.ctx, fmt.Sprintf("Product with ID %d not found for update", id))
		return nil, fmt.Errorf("product with ID %d not found", id)
	}
	product := &Product{ID: id, Name: name, Price: price}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product updated: %+v", product))
	return product, nil
}

func (s *ProductService) DeleteProduct(id int) error {
	result, err := s.db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		runtime.LogError(s.ctx, fmt.Sprintf("Failed to delete product with ID %d: %v", id, err))
		return fmt.Errorf("failed to delete product: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		runtime.LogWarning(s.ctx, fmt.Sprintf("Product with ID %d not found for deletion", id))
		return fmt.Errorf("product with ID %d not found", id)
	}
	runtime.LogInfo(s.ctx, fmt.Sprintf("Product deleted: ID %d", id))
	return nil
}
