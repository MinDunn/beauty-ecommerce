import { HeroBanner } from '../components/home/HeroBanner';
import { ProductGrid } from '../components/home/ProductGrid';
import { SEO } from '../components/common/SEO';

const Home = () => {
  return (
    <main className="w-full min-h-screen bg-white pb-20">
      <SEO 
        description="Glowzy. - Thiên đường mỹ phẩm cao cấp chính hãng. Khám phá bí quyết chăm sóc sắc đẹp từ các thương hiệu hàng đầu thế giới."
      />
      <HeroBanner />
      <ProductGrid 
        title="Flash Sale Hôm Nay ⚡" 
        type="flash-sale"
        isCarousel={true} 
        autoPlay={true} 
        viewAllLink="/category?onSale=true"
      />
      <ProductGrid 
        title="Gợi ý riêng cho bạn" 
        subtitle="Các sản phẩm được yêu thích nhất trong tuần"
        type="trending" 
        isCarousel={true} 
        autoPlay={false}
        infinite={false}
        viewAllLink="/category?sort=trending"
      />
    </main>
  );
};

export default Home;
