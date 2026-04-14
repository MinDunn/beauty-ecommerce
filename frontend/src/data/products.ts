export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  brand: string;
  category: string;
  skinType?: string;
  variant?: string;
  image: string;
  badge?: string;
  isFeatured?: boolean;
  rating?: number;
  reviews?: number;
  sold?: number;
}

export const products: Product[] = [];
