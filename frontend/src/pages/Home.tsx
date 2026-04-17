import { HeroBanner } from '../components/home/HeroBanner';
import { ProductGrid } from '../components/home/ProductGrid';
const Home = () => {
  return (
    <main className="w-full min-h-screen bg-white pb-20">
      <HeroBanner />
      <ProductGrid title="Flash Sale Hôm Nay ⚡" />
      <ProductGrid title="Gợi ý riêng cho bạn" type="trending" />
    </main>
  );
};

export default Home;
