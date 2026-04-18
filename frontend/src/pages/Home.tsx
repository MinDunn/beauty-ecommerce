import { HeroBanner } from '../components/home/HeroBanner';
import { ProductGrid } from '../components/home/ProductGrid';

const Home = () => {
  return (
    <main className="w-full min-h-screen bg-white pb-20">
      <HeroBanner />
      <ProductGrid title="Flash Sale Hôm Nay ⚡" isCarousel={true} autoPlay={true} />
      <ProductGrid 
        title="Gợi ý riêng cho bạn" 
        subtitle="Các sản phẩm được yêu thích nhất trong tuần"
        type="trending" 
        isCarousel={true} 
        autoPlay={false}
        infinite={false}
      />
    </main>
  );
};

export default Home;
