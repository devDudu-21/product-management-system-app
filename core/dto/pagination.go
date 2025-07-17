package dto

import (
	"product-management-app/core/models"
)

type PaginationDTO struct {
	Page     int    `json:"page"`
	PageSize int    `json:"pageSize"`
	Search   string `json:"search,omitempty"`
	SortBy   string `json:"sortBy,omitempty"`
	Order    string `json:"order,omitempty"`
}

type PaginationResponse struct {
	Products   []*models.Product `json:"products"`
	TotalCount int               `json:"totalCount"`
	TotalPages int               `json:"totalPages"`
	Page       int               `json:"page"`
	PageSize   int               `json:"pageSize"`
}
