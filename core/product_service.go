package core

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type ProductService struct {
	db *sql.DB
}

func NewProductService() *ProductService {
	return &ProductService{}
}

func (s *ProductService) InitDatabase() error {
	var err error
	s.db, err = sql.Open("sqlite3", "./database.db")
	if err != nil {
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
	log.Println("SQLite database and 'products' table initialized successfully!")
	return nil
}

func (s *ProductService) CloseDatabase() {
	if s.db != nil {
		s.db.Close()
		log.Println("Database connection closed.")
	}
}

// verify if the database connection is healthy
func (s *ProductService) HealthCheck() error {
	if s.db == nil {
		return fmt.Errorf("database connection not established")
	}

	// tries to ping the database to check if it's active
	if err := s.db.Ping(); err != nil {
		return fmt.Errorf("database is not active: %w", err)
	}

	return nil
}

func (s *ProductService) CreateProduct(name string, price float64) (*Product, error) {
	res, err := s.db.Exec("INSERT INTO products(name, price) VALUES(?, ?)", name, price)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}
	id, _ := res.LastInsertId()
	product := &Product{ID: int(id), Name: name, Price: price}
	log.Printf("Product created: %+v\n", product)
	return product, nil
}

func (s *ProductService) GetProductByID(id int) (*Product, error) {
	row := s.db.QueryRow("SELECT id, name, price FROM products WHERE id = ?", id)
	var product Product
	err := row.Scan(&product.ID, &product.Name, &product.Price)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("product with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to fetch product: %w", err)
	}
	log.Printf("Product found: %+v\n", product)
	return &product, nil
}

func (s *ProductService) GetAllProducts() ([]*Product, error) {
	rows, err := s.db.Query("SELECT id, name, price FROM products")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch products: %w", err)
	}
	defer rows.Close()

	var products []*Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Price); err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, &product)
	}
	log.Printf("Products found: %d\n", len(products))
	return products, nil
}

func (s *ProductService) UpdateProduct(id int, name string, price float64) (*Product, error) {
	result, err := s.db.Exec("UPDATE products SET name = ?, price = ? WHERE id = ?", name, price, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return nil, fmt.Errorf("product with ID %d not found", id)
	}
	product := &Product{ID: id, Name: name, Price: price}
	log.Printf("Product updated: %+v\n", product)
	return product, nil
}

func (s *ProductService) DeleteProduct(id int) error {
	result, err := s.db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("product with ID %d not found", id)
	}
	log.Printf("Product deleted: ID %d\n", id)
	return nil
}
