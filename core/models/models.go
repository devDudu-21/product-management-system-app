package models

type Product struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Price       float64  `json:"price"`
	Category    *string  `json:"category,omitempty"`
	Stock       int      `json:"stock"`
	Description *string  `json:"description,omitempty"`
	ImageURL    *string  `json:"imageUrl,omitempty"`
	CreatedAt   string   `json:"createdAt"`
	UpdatedAt   *string  `json:"updatedAt,omitempty"`
}
