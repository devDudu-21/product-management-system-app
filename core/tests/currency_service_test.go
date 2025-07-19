package test

import (
	"context"
	"testing"
	"time"

	"product-management-app/core/dto"
	service "product-management-app/core/services"
)

func TestCurrencyService_ConvertCurrency(t *testing.T) {
	ctx := context.Background()
	currencyService := service.NewCurrencyService(ctx)

	tests := []struct {
		name        string
		request     dto.CurrencyConversionRequest
		expectError bool
	}{
		{
			name: "Valid conversion USD to EUR",
			request: dto.CurrencyConversionRequest{
				Amount:       100.0,
				FromCurrency: "USD",
				ToCurrency:   "EUR",
			},
			expectError: false,
		},
		{
			name: "Valid conversion EUR to BRL",
			request: dto.CurrencyConversionRequest{
				Amount:       50.0,
				FromCurrency: "EUR",
				ToCurrency:   "BRL",
			},
			expectError: false,
		},
		{
			name: "Same currency conversion",
			request: dto.CurrencyConversionRequest{
				Amount:       100.0,
				FromCurrency: "USD",
				ToCurrency:   "USD",
			},
			expectError: false,
		},
		{
			name: "Negative amount",
			request: dto.CurrencyConversionRequest{
				Amount:       -100.0,
				FromCurrency: "USD",
				ToCurrency:   "EUR",
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, err := currencyService.ConvertCurrency(tt.request)

			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if response == nil {
				t.Errorf("Expected response but got nil")
				return
			}

			// Validate response fields
			if response.Amount != tt.request.Amount {
				t.Errorf("Expected amount %f, got %f", tt.request.Amount, response.Amount)
			}

			if response.FromCurrency != tt.request.FromCurrency {
				t.Errorf("Expected fromCurrency %s, got %s", tt.request.FromCurrency, response.FromCurrency)
			}

			if response.ToCurrency != tt.request.ToCurrency {
				t.Errorf("Expected toCurrency %s, got %s", tt.request.ToCurrency, response.ToCurrency)
			}

			// For same currency conversion, rate should be 1 and converted amount should equal original
			if tt.request.FromCurrency == tt.request.ToCurrency {
				if response.ExchangeRate != 1.0 {
					t.Errorf("Expected exchange rate 1.0 for same currency, got %f", response.ExchangeRate)
				}
				if response.ConvertedAmount != tt.request.Amount {
					t.Errorf("Expected converted amount %f for same currency, got %f", tt.request.Amount, response.ConvertedAmount)
				}
			}

			// Validate conversion date is recent
			if time.Since(response.ConversionDate) > time.Minute {
				t.Errorf("Conversion date seems too old: %v", response.ConversionDate)
			}
		})
	}
}

func TestCurrencyService_GetSupportedCurrencies(t *testing.T) {
	ctx := context.Background()
	currencyService := service.NewCurrencyService(ctx)

	response := currencyService.GetSupportedCurrencies()

	if response == nil {
		t.Errorf("Expected response but got nil")
		return
	}

	if len(response.Currencies) == 0 {
		t.Errorf("Expected currencies but got empty list")
		return
	}

	// Check if BRL, USD, and EUR are present
	expectedCurrencies := []string{"BRL", "USD", "EUR"}
	foundCurrencies := make(map[string]bool)

	for _, currency := range response.Currencies {
		foundCurrencies[currency.Code] = true

		// Validate currency info has required fields
		if currency.Code == "" {
			t.Errorf("Currency code is empty")
		}
		if currency.Symbol == "" {
			t.Errorf("Currency symbol is empty for %s", currency.Code)
		}
		if currency.Name == "" {
			t.Errorf("Currency name is empty for %s", currency.Code)
		}
	}

	for _, expected := range expectedCurrencies {
		if !foundCurrencies[expected] {
			t.Errorf("Expected currency %s not found in supported currencies", expected)
		}
	}
}

func TestCurrencyService_GetExchangeRatesForCurrency(t *testing.T) {
	ctx := context.Background()
	currencyService := service.NewCurrencyService(ctx)

	// Test with EUR as base currency
	response, err := currencyService.GetExchangeRatesForCurrency("EUR")

	if err != nil {
		t.Logf("Warning: API call failed (this is expected in CI/offline environments): %v", err)
		return
	}

	if response == nil {
		t.Errorf("Expected response but got nil")
		return
	}

	if response.Base != "EUR" {
		t.Errorf("Expected base currency EUR, got %s", response.Base)
	}

	if len(response.Rates) == 0 {
		t.Errorf("Expected exchange rates but got empty map")
	}

	// Validate date format
	if response.Date == "" {
		t.Errorf("Expected date but got empty string")
	}
}
