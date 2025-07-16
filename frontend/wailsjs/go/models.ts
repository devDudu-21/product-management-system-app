export namespace core {
	
	export class Product {
	    id: number;
	    name: string;
	    price: number;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.price = source["price"];
	    }
	}
	export class PaginationResponse {
	    products: Product[];
	    totalCount: number;
	    totalPages: number;
	    page: number;
	    pageSize: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginationResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.products = this.convertValues(source["products"], Product);
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

}

export namespace pagination_dto {
	
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

}

