package repositories

import (
	"context"
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"product-management-app/core/dto"
	"product-management-app/core/models"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(name string, price float64) (*models.Product, error) {
	res, err := r.db.Exec("INSERT INTO products(name, price) VALUES(?, ?)", name, price)
	if err != nil {
		runtime.LogError(context.Background(), fmt.Sprintf("Failed to create product: %v", err))
		return nil, fmt.Errorf("failed to create product: %w", err)
	}
	id, _ := res.LastInsertId()
	product := &models.Product{ID: int(id), Name: name, Price: price}
	runtime.LogInfo(context.Background(), fmt.Sprintf("Product created: %+v", product))
	return product, nil
}

func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	row := r.db.QueryRow("SELECT id, name, price FROM products WHERE id = ?", id)
	product := &models.Product{}
	err := row.Scan(&product.ID, &product.Name, &product.Price)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("product with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to fetch product: %w", err)
	}
	return product, nil
}

func (r *ProductRepository) GetAll(params pagination_dto.PaginationDTO) (*pagination_dto.PaginationResponse, error) {
	offset := (params.Page - 1) * params.PageSize
	rows, err := r.db.Query("SELECT id, name, price FROM products LIMIT ? OFFSET ?", params.PageSize, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch products: %w", err)
	}
	defer rows.Close()

	products := []*models.Product{}
	for rows.Next() {
		product := &models.Product{}
		if err := rows.Scan(&product.ID, &product.Name, &product.Price); err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, product)
	}

	totalCount := 0
	r.db.QueryRow("SELECT COUNT(*) FROM products").Scan(&totalCount)
	totalPages := (totalCount + params.PageSize - 1) / params.PageSize

	return &pagination_dto.PaginationResponse{
		Products:   products,
		TotalCount: totalCount,
		TotalPages: totalPages,
		Page:       params.Page,
		PageSize:   params.PageSize,
	}, nil
}

func (r *ProductRepository) Update(id int, name string, price float64) (*models.Product, error) {
	res, err := r.db.Exec("UPDATE products SET name = ?, price = ? WHERE id = ?", name, price, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return nil, fmt.Errorf("product with ID %d not found", id)
	}
	product := &models.Product{ID: id, Name: name, Price: price}
	return product, nil
}

func (r *ProductRepository) Delete(id int) error {
	res, err := r.db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("product with ID %d not found", id)
	}
	return nil
}
