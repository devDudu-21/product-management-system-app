package dto

import "time"

type CurrencyRatesResponse struct {
	Date  string             `json:"date"`
	Base  string             `json:"base,omitempty"`
	Rates map[string]float64 `json:"rates,omitempty"`
}

type CurrencyConversionRequest struct {
	Amount       float64 `json:"amount"`
	FromCurrency string  `json:"fromCurrency"`
	ToCurrency   string  `json:"toCurrency"`
}

type CurrencyConversionResponse struct {
	Amount          float64   `json:"amount"`
	FromCurrency    string    `json:"fromCurrency"`
	ToCurrency      string    `json:"toCurrency"`
	ConvertedAmount float64   `json:"convertedAmount"`
	ExchangeRate    float64   `json:"exchangeRate"`
	ConversionDate  time.Time `json:"conversionDate"`
}

type SupportedCurrenciesResponse struct {
	Currencies []CurrencyInfo `json:"currencies"`
}

type CurrencyInfo struct {
	Code   string `json:"code"`
	Symbol string `json:"symbol"`
	Name   string `json:"name"`
}
