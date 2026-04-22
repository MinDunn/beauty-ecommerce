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
  origin?: string;
  warnings?: string;
  instructions?: string;
  ingredients?: string;
  expiryDate?: string;
  categoryId?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Serum Vitamin C",
    price: 250000,
    originalPrice: 300000,
    brand: "Brand A",
    category: "Trang điểm",
    skinType: "All",
    image: "https://example.com/serum.jpg",
    instructions: "Thoa nhẹ nhàng",
    ingredients: "Vitamin C, Aqua, Glycerin",
    origin: "Made in France",
    warnings: "Tránh dùng cho da nhạy cảm",
    expiryDate: "2025-12-31",
    categoryId: 1
  },
  {
    id: "2",
    name: "Kem Dưỡng ẩm",
    price: 180000,
    originalPrice: 200000,
    brand: "Brand B",
    category: "Chăm sóc da",
    skinType: "Dry",
    image: "https://example.com/cream.jpg",
    instructions: "Thoa lên da sạch",
    ingredients: "Water, Shea Butter, Vitamin E",
    origin: "Made in Korea",
    warnings: "Không gây dị ứng",
    expiryDate: "2026-06-30",
    categoryId: 2
  },
  {
    id: "3",
    name: "Mặt Nạ Đắp",
    price: 130000,
    originalPrice: 150000,
    brand: "Brand C",
    category: "Trang điểm",
    skinType: "Oily",
    image: "https://example.com/mask.jpg",
    instructions: "Đắp 15 phút",
    ingredients: "Clay, Charcoal",
    origin: "Made in USA",
    warnings: "Không dùng quá 2 lần/tuần",
    expiryDate: "2025-09-15",
    categoryId: 1
  },
  {
    id: "4",
    name: "Sữa Rửa Mặt",
    price: 100000,
    originalPrice: 120000,
    brand: "Brand D",
    category: "Chăm sóc da",
    skinType: "Mixed",
    image: "https://example.com/cleanser.jpg",
    instructions: "Rửa mặt 2 lần",
    ingredients: "Aloe, Glycerin",
    origin: "Made in Japan",
    warnings: "Tránh dùng nếu da bị tổn thương",
    expiryDate: "2025-11-20",
    categoryId: 2
  },
  {
    id: "5",
    name: "Toner Thanh Lọc",
    price: 95000,
    originalPrice: 110000,
    brand: "Brand E",
    category: "Trang điểm",
    skinType: "All",
    image: "https://example.com/toner.jpg",
    instructions: "Thoa bằng bông tẩy",
    ingredients: "Witch Hazel, Rose Water",
    origin: "Made in Vietnam",
    warnings: "Không gây kích ứng",
    expiryDate: "2026-01-10",
    categoryId: 1
  }
];
