package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"product-management-app/core/dto"
)

type CurrencyService struct {
	ctx                 context.Context
	httpClient          *http.Client
	cachedRates         map[string]map[string]float64 // [baseCurrency][targetCurrency]rate
	cacheExpiry         map[string]time.Time          // [baseCurrency]expiryTime
	cacheMutex          sync.RWMutex
	cacheTimeout        time.Duration
	supportedCurrencies map[string]dto.CurrencyInfo
}

const (
	primaryAPIURL  = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies"
	fallbackAPIURL = "https://latest.currency-api.pages.dev/v1/currencies"

	defaultCacheTimeout = 30 * time.Minute

	httpTimeout = 10 * time.Second
)

func NewCurrencyService(ctx context.Context) *CurrencyService {
	return &CurrencyService{
		ctx:                 ctx,
		httpClient:          &http.Client{Timeout: httpTimeout},
		cachedRates:         make(map[string]map[string]float64),
		cacheExpiry:         make(map[string]time.Time),
		cacheTimeout:        defaultCacheTimeout,
		supportedCurrencies: initSupportedCurrencies(),
	}
}

func (cs *CurrencyService) logInfo(message string) {
	// Para standalone testing, apenas usa log padrão
	log.Printf("INFO: %s", message)
}

func (cs *CurrencyService) logWarning(message string) {
	log.Printf("WARNING: %s", message)
}

func (cs *CurrencyService) logError(message string) {
	log.Printf("ERROR: %s", message)
}

func initSupportedCurrencies() map[string]dto.CurrencyInfo {
	return map[string]dto.CurrencyInfo{
		"BRL": {Code: "BRL", Symbol: "R$", Name: "Brazilian Real"},
		"USD": {Code: "USD", Symbol: "$", Name: "US Dollar"},
		"EUR": {Code: "EUR", Symbol: "€", Name: "Euro"},
		"GBP": {Code: "GBP", Symbol: "£", Name: "British Pound"},
		"JPY": {Code: "JPY", Symbol: "¥", Name: "Japanese Yen"},
		"CAD": {Code: "CAD", Symbol: "C$", Name: "Canadian Dollar"},
		"AUD": {Code: "AUD", Symbol: "A$", Name: "Australian Dollar"},
		"CHF": {Code: "CHF", Symbol: "CHF", Name: "Swiss Franc"},
		"CNY": {Code: "CNY", Symbol: "¥", Name: "Chinese Yuan"},
		"INR": {Code: "INR", Symbol: "₹", Name: "Indian Rupee"},
	}
}

func (cs *CurrencyService) fetchExchangeRates(baseCurrency string) (map[string]float64, error) {
	baseCurrency = strings.ToLower(baseCurrency)

	rates, err := cs.fetchFromURL(fmt.Sprintf("%s/%s.json", primaryAPIURL, baseCurrency))
	if err != nil {
		cs.logWarning(fmt.Sprintf("Primary API failed for %s: %v, trying fallback", baseCurrency, err))

		rates, err = cs.fetchFromURL(fmt.Sprintf("%s/%s.json", fallbackAPIURL, baseCurrency))
		if err != nil {
			cs.logError(fmt.Sprintf("Both APIs failed for %s: %v", baseCurrency, err))
			return nil, fmt.Errorf("failed to fetch exchange rates from both APIs: %v", err)
		}
	}

	cs.logInfo(fmt.Sprintf("Successfully fetched exchange rates for %s", baseCurrency))
	return rates, nil
}

func (cs *CurrencyService) fetchFromURL(url string) (map[string]float64, error) {
	cs.logInfo(fmt.Sprintf("Fetching exchange rates from: %s", url))

	resp, err := cs.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	var apiResponse map[string]interface{}
	if err := json.Unmarshal(body, &apiResponse); err != nil {
		return nil, fmt.Errorf("failed to parse JSON response: %v", err)
	}

	rates := make(map[string]float64)

	for key, value := range apiResponse {
		if key != "date" {
			if ratesMap, ok := value.(map[string]interface{}); ok {
				for currency, rate := range ratesMap {
					if rateFloat, ok := rate.(float64); ok {
						rates[strings.ToUpper(currency)] = rateFloat
					}
				}
			}
		}
	}

	if len(rates) == 0 {
		return nil, fmt.Errorf("no exchange rates found in API response")
	}

	return rates, nil
}

func (cs *CurrencyService) getRatesFromCache(baseCurrency string) (map[string]float64, bool) {
	cs.cacheMutex.RLock()
	defer cs.cacheMutex.RUnlock()

	if expiry, exists := cs.cacheExpiry[baseCurrency]; exists && time.Now().Before(expiry) {
		if rates, exists := cs.cachedRates[baseCurrency]; exists {
			cs.logInfo(fmt.Sprintf("Using cached rates for %s", baseCurrency))
			return rates, true
		}
	}

	return nil, false
}

func (cs *CurrencyService) saveRatesToCache(baseCurrency string, rates map[string]float64) {
	cs.cacheMutex.Lock()
	defer cs.cacheMutex.Unlock()

	cs.cachedRates[baseCurrency] = rates
	cs.cacheExpiry[baseCurrency] = time.Now().Add(cs.cacheTimeout)

	cs.logInfo(fmt.Sprintf("Cached rates for %s until %v", baseCurrency, cs.cacheExpiry[baseCurrency]))
}

func (cs *CurrencyService) getExchangeRate(fromCurrency, toCurrency string) (float64, error) {
	fromCurrency = strings.ToUpper(fromCurrency)
	toCurrency = strings.ToUpper(toCurrency)

	if fromCurrency == toCurrency {
		return 1.0, nil
	}

	if rates, found := cs.getRatesFromCache(fromCurrency); found {
		if rate, exists := rates[toCurrency]; exists {
			return rate, nil
		}
	}

	rates, err := cs.fetchExchangeRates(fromCurrency)
	if err != nil {
		return 0, err
	}

	cs.saveRatesToCache(fromCurrency, rates)

	if rate, exists := rates[toCurrency]; exists {
		return rate, nil
	}

	return 0, fmt.Errorf("exchange rate not found for %s to %s", fromCurrency, toCurrency)
}

func (cs *CurrencyService) ConvertCurrency(request dto.CurrencyConversionRequest) (*dto.CurrencyConversionResponse, error) {
	cs.logInfo(fmt.Sprintf("Converting %.2f %s to %s", request.Amount, request.FromCurrency, request.ToCurrency))

	if request.Amount < 0 {
		return nil, fmt.Errorf("amount must be positive")
	}

	rate, err := cs.getExchangeRate(request.FromCurrency, request.ToCurrency)
	if err != nil {
		return nil, err
	}

	convertedAmount := request.Amount * rate

	response := &dto.CurrencyConversionResponse{
		Amount:          request.Amount,
		FromCurrency:    strings.ToUpper(request.FromCurrency),
		ToCurrency:      strings.ToUpper(request.ToCurrency),
		ConvertedAmount: convertedAmount,
		ExchangeRate:    rate,
		ConversionDate:  time.Now(),
	}

	cs.logInfo(fmt.Sprintf("Conversion successful: %.2f %s = %.2f %s (rate: %.6f)",
		request.Amount, response.FromCurrency, convertedAmount, response.ToCurrency, rate))

	return response, nil
}

func (cs *CurrencyService) GetSupportedCurrencies() *dto.SupportedCurrenciesResponse {
	currencies := make([]dto.CurrencyInfo, 0, len(cs.supportedCurrencies))
	for _, currency := range cs.supportedCurrencies {
		currencies = append(currencies, currency)
	}

	return &dto.SupportedCurrenciesResponse{
		Currencies: currencies,
	}
}

func (cs *CurrencyService) GetExchangeRatesForCurrency(baseCurrency string) (*dto.CurrencyRatesResponse, error) {
	baseCurrency = strings.ToUpper(baseCurrency)
	cs.logInfo(fmt.Sprintf("Getting all exchange rates for %s", baseCurrency))

	if rates, found := cs.getRatesFromCache(baseCurrency); found {
		return &dto.CurrencyRatesResponse{
			Date:  time.Now().Format("2006-01-02"),
			Base:  baseCurrency,
			Rates: rates,
		}, nil
	}

	rates, err := cs.fetchExchangeRates(baseCurrency)
	if err != nil {
		return nil, err
	}

	cs.saveRatesToCache(baseCurrency, rates)

	return &dto.CurrencyRatesResponse{
		Date:  time.Now().Format("2006-01-02"),
		Base:  baseCurrency,
		Rates: rates,
	}, nil
}

func (cs *CurrencyService) ClearCache() {
	cs.cacheMutex.Lock()
	defer cs.cacheMutex.Unlock()

	cs.cachedRates = make(map[string]map[string]float64)
	cs.cacheExpiry = make(map[string]time.Time)

	cs.logInfo("Currency exchange rates cache cleared")
}
