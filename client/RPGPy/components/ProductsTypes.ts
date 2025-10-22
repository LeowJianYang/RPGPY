
export interface Product {
  id: number | string; 
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  description?: string;
}