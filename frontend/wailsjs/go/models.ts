export namespace dto {
	
	export class CreateProductDTO {
	    name: string;
	    price: number;
	    category?: string;
	    stock?: number;
	    description?: string;
	    imageUrl?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateProductDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.price = source["price"];
	        this.category = source["category"];
	        this.stock = source["stock"];
	        this.description = source["description"];
	        this.imageUrl = source["imageUrl"];
	    }
	}
	export class CurrencyConversionRequest {
	    amount: number;
	    fromCurrency: string;
	    toCurrency: string;
	
	    static createFrom(source: any = {}) {
	        return new CurrencyConversionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.amount = source["amount"];
	        this.fromCurrency = source["fromCurrency"];
	        this.toCurrency = source["toCurrency"];
	    }
	}
	export class CurrencyConversionResponse {
	    amount: number;
	    fromCurrency: string;
	    toCurrency: string;
	    convertedAmount: number;
	    exchangeRate: number;
	    // Go type: time
	    conversionDate: any;
	
	    static createFrom(source: any = {}) {
	        return new CurrencyConversionResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.amount = source["amount"];
	        this.fromCurrency = source["fromCurrency"];
	        this.toCurrency = source["toCurrency"];
	        this.convertedAmount = source["convertedAmount"];
	        this.exchangeRate = source["exchangeRate"];
	        this.conversionDate = this.convertValues(source["conversionDate"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CurrencyInfo {
	    code: string;
	    symbol: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new CurrencyInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.symbol = source["symbol"];
	        this.name = source["name"];
	    }
	}
	export class CurrencyRatesResponse {
	    date: string;
	    base?: string;
	    rates?: Record<string, number>;
	
	    static createFrom(source: any = {}) {
	        return new CurrencyRatesResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.base = source["base"];
	        this.rates = source["rates"];
	    }
	}
	export class ImportError {
	    row: number;
	    field: string;
	    message: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new ImportError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.row = source["row"];
	        this.field = source["field"];
	        this.message = source["message"];
	        this.value = source["value"];
	    }
	}
	export class ImportResult {
	    successCount: number;
	    errorCount: number;
	    errors?: ImportError[];
	    importedItems?: models.Product[];
	
	    static createFrom(source: any = {}) {
	        return new ImportResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.successCount = source["successCount"];
	        this.errorCount = source["errorCount"];
	        this.errors = this.convertValues(source["errors"], ImportError);
	        this.importedItems = this.convertValues(source["importedItems"], models.Product);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginationDTO {
	    page: number;
	    pageSize: number;
	    search?: string;
	    sortBy?: string;
	    order?: string;
	
	    static createFrom(source: any = {}) {
	        return new PaginationDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.search = source["search"];
	        this.sortBy = source["sortBy"];
	        this.order = source["order"];
	    }
	}
	export class PaginationResponse {
	    products: models.Product[];
	    totalCount: number;
	    totalPages: number;
	    page: number;
	    pageSize: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginationResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.products = this.convertValues(source["products"], models.Product);
	        this.totalCount = source["totalCount"];
	        this.totalPages = source["totalPages"];
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SupportedCurrenciesResponse {
	    currencies: CurrencyInfo[];
	
	    static createFrom(source: any = {}) {
	        return new SupportedCurrenciesResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.currencies = this.convertValues(source["currencies"], CurrencyInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace models {
	
	export class Product {
	    id: number;
	    name: string;
	    price: number;
	    category?: string;
	    stock: number;
	    description?: string;
	    imageUrl?: string;
	    createdAt: string;
	    updatedAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.price = source["price"];
	        this.category = source["category"];
	        this.stock = source["stock"];
	        this.description = source["description"];
	        this.imageUrl = source["imageUrl"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}

}

