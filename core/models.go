package core

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

type PaginationResponse struct {
	Products   []*Product `json:"products"`
	TotalCount int        `json:"totalCount"`
	TotalPages int        `json:"totalPages"`
	Page       int        `json:"page"`
	PageSize   int        `json:"pageSize"`
}
