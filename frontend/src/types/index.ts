export type Product = {
  id: number;
  name: string;
  description?: string;
  originalPrice: number;
  currentPrice: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  instructions?: string;
  ingredients?: string;
  images?: string[];
  variants?: {
    id: number;
    variantName: string;
    price: number;
    imageUrl?: string;
    stockQuantity?: number;
  }[];
  skinType?: string;
  createdAt?: string;
  expiryDate: string;
  status: 'ACTIVE' | 'HIDDEN' | 'DISCONTINUED';
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
};

export type OrderItem = {
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
  subTotal: number;
};

export type CartItem = {
  productId: number;
  productName: string;
  image: string;
  brand: string;
  quantity: number;
  stockQuantity?: number;
  variantName?: string | null;
  price: number;
  subTotal: number;
};

export type Order = {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  items: OrderItem[];
};

export type Feedback = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type InventoryReceipt = {
  id: number;
  productId: number;
  productName?: string;
  costPrice: number;
  quantity: number;
  variantName?: string;
  receivedAt: string;
};