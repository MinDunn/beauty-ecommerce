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

export const products: Product[] = [
  // CHĂM SÓC DA (SKINCARE)
  {
    id: 'lrp-anthelios-1',
    name: 'Kem Chống Nắng La Roche-Posay Anthelios UVmune 400 Oil Control Gel-Cream',
    price: 435000,
    originalPrice: 535000,
    brand: 'La Roche-Posay',
    category: 'skincare',
    skinType: 'Da Dầu / Mụn',
    image: '/images/lrp_anthelios.png',
    badge: 'Bán chạy',
    isFeatured: true
  },
  {
    id: 'cerave-foaming-1',
    name: 'Sữa Rửa Mặt CeraVe Foaming Cleanser Cho Da Dầu & Nhạy Cảm',
    price: 365000,
    brand: 'CeraVe',
    category: 'skincare',
    skinType: 'Da Dầu / Mụn',
    image: '/images/st_ives_scrub.png',
    isFeatured: true
  },
  {
    id: 'vichy-mineral-89-1',
    name: 'Dưỡng Chất Khoáng Phục Hồi Chuyên Sâu Vichy Minéral 89',
    price: 790000,
    originalPrice: 950000,
    brand: 'Vichy',
    category: 'skincare',
    skinType: 'Mọi loại da',
    image: '/images/bioderma_shower_gel.png',
    badge: 'Hot',
    isFeatured: true
  },
  {
    id: 'bioderma-sensibio-1',
    name: 'Nước Tẩy Trang Cho Da Nhạy Cảm Bioderma Sensibio H2O (Nắp Hồng)',
    price: 495000,
    brand: 'Bioderma',
    category: 'skincare',
    skinType: 'Da Nhạy Cảm',
    image: '/images/thayer_toner.png',
    badge: 'Best Seller'
  },
  {
    id: 'neutrogena-hydro-1',
    name: 'Kem Dưỡng Ẩm Neutrogena Hydro Boost Water Gel',
    price: 350000,
    originalPrice: 420000,
    brand: 'Neutrogena',
    category: 'skincare',
    skinType: 'Da Khô',
    image: '/images/vaseline_lotion.png',
    isFeatured: true
  },
  {
    id: 'paula-bha-1',
    name: 'Dung Dịch Loại Bỏ Tế Bào Chết Paula\'s Choice Skin Perfecting 2% BHA Liquid Exfoliant',
    price: 899000,
    originalPrice: 1100000,
    brand: 'Paula\'s Choice',
    category: 'skincare',
    skinType: 'Da Dầu / Mụn',
    image: '/images/lrp_anthelios.png',
    badge: 'Đặc trị'
  },
  {
    id: 'loreal-glycolic-1',
    name: 'Serum L\'Oréal Paris Glycolic Bright Sáng Da Tức Thì',
    price: 429000,
    brand: 'L\'Oréal Paris',
    category: 'skincare',
    skinType: 'Mọi loại da',
    image: '/images/love_beauty_planet.png'
  },
  {
    id: 'anessa-gold-1',
    name: 'Sữa Chống Nắng Anessa Perfect UV Sunscreen Skincare Milk N SPF50+ PA++++',
    price: 540000,
    originalPrice: 685000,
    brand: 'Anessa',
    category: 'skincare',
    skinType: 'Mọi loại da',
    image: '/images/lrp_anthelios.png',
    badge: 'Summer Sale'
  },
  {
    id: 'thayers-toner-1',
    name: 'Nước Hoa Hồng Thayers Không Cồn Witch Hazel Toner',
    price: 290000,
    brand: 'Thayers',
    category: 'skincare',
    skinType: 'Mọi loại da',
    image: '/images/thayer_toner.png'
  },

  // TRANG ĐIỂM (MAKEUP)
  {
    id: 'maybelline-fitme-1',
    name: 'Kem Nền Maybelline Fit Me Matte + Poreless Kiềm Dầu Chống Nắng',
    price: 245000,
    brand: 'Maybelline',
    category: 'makeup',
    image: '/images/maybelline_foundation.png',
    badge: 'Mới'
  },
  {
    id: 'mac-lipstick-1',
    name: 'Son Lì MAC Retro Matte Lipstick - Ruby Woo',
    price: 650000,
    brand: 'MAC',
    category: 'makeup',
    image: '/images/mac_lipstick.png',
    badge: 'Huyền thoại'
  },
  {
    id: '3ce-velvet-1',
    name: 'Son Kem Lì 3CE Velvet Lip Tint - Daffodil',
    price: 345000,
    brand: '3CE',
    category: 'makeup',
    image: '/images/3ce_liptint.png'
  },
  {
    id: 'maybelline-skyline-1',
    name: 'Mascara Maybelline Lash Sensational Sky High Dài & Cong Mi',
    price: 285000,
    brand: 'Maybelline',
    category: 'makeup',
    image: '/images/mascara.png',
    badge: 'Viral'
  },

  // CHĂM SÓC TÓC (HAIRCARE)
  {
    id: 'tresemme-keratin-1',
    name: 'Dầu Gội TRESemmé Keratin Smooth Vào Nếp Suôn Mượt',
    price: 215000,
    brand: 'TRESemmé',
    category: 'haircare',
    image: '/images/tresemme_shampoo.png'
  },
  {
    id: 'lpb-argan-1',
    name: 'Dầu Gội Love Beauty and Planet Smooth and Serene Argan Oil & Lavender',
    price: 185000,
    brand: 'Love Beauty and Planet',
    category: 'haircare',
    image: '/images/love_beauty_planet.png',
    badge: 'Vegan'
  },
  {
    id: 'ogx-biotin-1',
    name: 'Dầu Gội OGX Thick & Full + Biotin & Collagen Ngăn Rụng Tóc',
    price: 295000,
    brand: 'OGX',
    category: 'haircare',
    image: '/images/ogx_shampoo.png'
  },

  // CHĂM SÓC CƠ THỂ (BODYCARE)
  {
    id: 'vaseline-gluta-1',
    name: 'Sữa Dưỡng Thể Vaseline Gluta-Hya Sáng Da Nâng Tông',
    price: 165000,
    brand: 'Vaseline',
    category: 'bodycare',
    image: '/images/vaseline_lotion.png',
    badge: 'Hot Trend'
  },
  {
    id: 'bioderma-atoderm-1',
    name: 'Sữa Tắm Bioderma Atoderm Gel Douche Cho Da Khô & Nhạy Cảm',
    price: 395000,
    brand: 'Bioderma',
    category: 'bodycare',
    image: '/images/bioderma_shower_gel.png'
  },
  {
    id: 'st-ives-scrub-1',
    name: 'Tẩy Tế Bào Chết Toàn Thân St. Ives Fresh Skin Apricot Scrub',
    price: 155000,
    brand: 'St. Ives',
    category: 'bodycare',
    image: '/images/st_ives_scrub.png'
  },

  // THỰC PHẨM CHỨC NĂNG (SUPPLEMENTS)
  {
    id: 'dhc-vitamin-c-1',
    name: 'Viên Uống Hỗ Trợ Bổ Sung Vitamin C DHC Vitamin C Nhật Bản',
    price: 195000,
    brand: 'DHC',
    category: 'supplements',
    image: '/images/dhc_vitamin_c.png',
    badge: 'Số 1 Nhật Bản'
  },
  {
    id: 'blackmores-fish-oil-1',
    name: 'Viên Uống Dầu Cá Không Mùi Blackmores Odourless Fish Oil',
    price: 450000,
    brand: 'Blackmores',
    category: 'supplements',
    image: '/images/blackmores_fishoil.png'
  },

  // GLOWZY EXCLUSIVE
  {
    id: 'glowzy-mask-1',
    name: 'Mặt Nạ Giấy Glowzy Moisturising Facial Mask (Bản Đặc Biệt)',
    price: 22500,
    originalPrice: 45000,
    brand: 'Glowzy',
    category: 'skincare',
    image: '/images/mac_lipstick.png',
    badge: 'Độc quyền'
  },
  {
    id: 'glowzy-cotton-1',
    name: 'Bông Tẩy Trang Glowzy Soft & Silky Cotton Rounds (80 Miếng)',
    price: 25000,
    originalPrice: 35000,
    brand: 'Glowzy',
    category: 'skincare',
    image: '/images/makeup.png',
    badge: 'Sản phẩm của năm'
  }
];
