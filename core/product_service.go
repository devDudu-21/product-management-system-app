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
		return fmt.Errorf("falha ao abrir o banco de dados: %w", err)
	}

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		price REAL NOT NULL
	);`

	_, err = s.db.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("falha ao criar a tabela de produtos: %w", err)
	}
	log.Println("Banco de dados SQLite e tabela 'products' inicializados com sucesso!")
	return nil
}

func (s *ProductService) CloseDatabase() {
	if s.db != nil {
		s.db.Close()
		log.Println("Conexão com o banco de dados fechada.")
	}
}

// HealthCheck verifica se a conexão com o banco está funcionando
func (s *ProductService) HealthCheck() error {
	if s.db == nil {
		return fmt.Errorf("conexão com banco de dados não foi estabelecida")
	}
	
	// Tenta fazer um ping no banco para verificar se está respondendo
	if err := s.db.Ping(); err != nil {
		return fmt.Errorf("banco de dados não está respondendo: %w", err)
	}
	
	return nil
}

func (s *ProductService) CreateProduct(name string, price float64) (*Product, error) {
	res, err := s.db.Exec("INSERT INTO products(name, price) VALUES(?, ?)", name, price)
	if err != nil {
		return nil, fmt.Errorf("falha ao criar produto: %w", err)
	}
	id, _ := res.LastInsertId()
	product := &Product{ID: int(id), Name: name, Price: price}
	log.Printf("Produto criado: %+v\n", product)
	return product, nil
}

func (s *ProductService) GetProductByID(id int) (*Product, error) {
	row := s.db.QueryRow("SELECT id, name, price FROM products WHERE id = ?", id)
	var product Product
	err := row.Scan(&product.ID, &product.Name, &product.Price)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("produto com ID %d não encontrado", id)
		}
		return nil, fmt.Errorf("falha ao buscar produto: %w", err)
	}
	log.Printf("Produto encontrado: %+v\n", product)
	return &product, nil
}

func (s *ProductService) GetAllProducts() ([]*Product, error) {
	rows, err := s.db.Query("SELECT id, name, price FROM products")
	if err != nil {
		return nil, fmt.Errorf("falha ao buscar produtos: %w", err)
	}
	defer rows.Close()

	var products []*Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Price); err != nil {
			return nil, fmt.Errorf("falha ao escanear produto: %w", err)
		}
		products = append(products, &product)
	}
	log.Printf("Produtos encontrados: %d\n", len(products))
	return products, nil
}

func (s *ProductService) UpdateProduct(id int, name string, price float64) (*Product, error) {
	result, err := s.db.Exec("UPDATE products SET name = ?, price = ? WHERE id = ?", name, price, id)
	if err != nil {
		return nil, fmt.Errorf("falha ao atualizar produto: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return nil, fmt.Errorf("produto com ID %d não encontrado", id)
	}
	product := &Product{ID: id, Name: name, Price: price}
	log.Printf("Produto atualizado: %+v\n", product)
	return product, nil
}

func (s *ProductService) DeleteProduct(id int) error {
	result, err := s.db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("falha ao deletar produto: %w", err)
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("produto com ID %d não encontrado", id)
	}
	log.Printf("Produto deletado: ID %d\n", id)
	return nil
}
