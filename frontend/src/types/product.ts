export interface CreateProductDTO {
  name: string;
  price: number;
  category?: string;
  stock?: number;
  description?: string;
  imageUrl?: string;
}
