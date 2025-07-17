package dto

type CreateProductDTO struct {
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Category    string  `json:"category,omitempty"`
	Stock       int     `json:"stock,omitempty"`
	Description string  `json:"description,omitempty"`
	ImageURL    string  `json:"imageUrl,omitempty"`
}
