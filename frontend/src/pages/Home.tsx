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
        title="Flash Sale - Hot Deal "
        type="flash-sale"
        isCarousel={true}
        autoPlay={true}
        viewAllLink="/category?onSale=true"
      />
      <ProductGrid
        title="Siêu Phẩm Được Yêu Thích"
        subtitle="Dựa trên lượt bình chọn và đánh giá từ khách hàng"
        type="trending"
        isCarousel={true}
        viewAllLink="/category?sort=trending"
      />
      <ProductGrid
        title="Hàng Mới Về "
        subtitle="Khám phá bộ sưu tập mới nhất"
        type="latest"
        isCarousel={false}
        showLoadMore={true}
        viewAllLink="/category?sort=createdAt,desc"
      />
    </main>
  );
};

export default Home;
