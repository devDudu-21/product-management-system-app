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

