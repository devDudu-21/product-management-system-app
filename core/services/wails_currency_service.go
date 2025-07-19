package service

import (
	"context"
	"log"

	"product-management-app/core/dto"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type WailsCurrencyService struct {
	*CurrencyService
	ctx context.Context
}

func NewWailsCurrencyService(ctx context.Context) *WailsCurrencyService {
	return &WailsCurrencyService{
		CurrencyService: NewCurrencyService(ctx),
		ctx:             ctx,
	}
}

func (wcs *WailsCurrencyService) logInfo(message string) {
	if wcs.ctx != nil {
		runtime.LogInfo(wcs.ctx, message)
	} else {
		log.Printf("INFO: %s", message)
	}
}

func (wcs *WailsCurrencyService) logWarning(message string) {
	if wcs.ctx != nil {
		runtime.LogWarning(wcs.ctx, message)
	} else {
		log.Printf("WARNING: %s", message)
	}
}

func (wcs *WailsCurrencyService) logError(message string) {
	if wcs.ctx != nil {
		runtime.LogError(wcs.ctx, message)
	} else {
		log.Printf("ERROR: %s", message)
	}
}

func (wcs *WailsCurrencyService) ConvertCurrency(request dto.CurrencyConversionRequest) (*dto.CurrencyConversionResponse, error) {
	wcs.logInfo("Converting " + request.FromCurrency + " to " + request.ToCurrency)
	return wcs.CurrencyService.ConvertCurrency(request)
}

func (wcs *WailsCurrencyService) GetExchangeRatesForCurrency(baseCurrency string) (*dto.CurrencyRatesResponse, error) {
	wcs.logInfo("Getting exchange rates for " + baseCurrency)
	return wcs.CurrencyService.GetExchangeRatesForCurrency(baseCurrency)
}

func (wcs *WailsCurrencyService) ClearCache() {
	wcs.logInfo("Clearing currency cache")
	wcs.CurrencyService.ClearCache()
}
