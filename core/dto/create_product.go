// Package dto contains data transfer objects for the product management application.
package dto

// CreateProductDTO represents the data required to create a new product.
type CreateProductDTO struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Category    string  `json:"category,omitempty"`
	Stock       int     `json:"stock,omitempty"`
	Description string  `json:"description,omitempty"`
	ImageURL    string  `json:"imageUrl,omitempty"`
}
