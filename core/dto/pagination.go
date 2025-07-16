package pagination_dto

type PaginationDTO struct {
	Page     int    `json:"page"`
	PageSize int    `json:"pageSize"`
	Search   string `json:"search,omitempty"`
	SortBy   string `json:"sortBy,omitempty"`
	Order    string `json:"order,omitempty"`
}
