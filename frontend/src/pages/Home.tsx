import { HeroBanner } from '../components/home/HeroBanner';
import { CategoryNav } from '../components/home/CategoryNav';
import { ProductGrid } from '../components/home/ProductGrid';

const Home = () => {
  return (
    <main className="w-full min-h-screen bg-white pb-20">
      <HeroBanner />
      <CategoryNav />
      <ProductGrid title="Flash Sale Hôm Nay ⚡" />
      <ProductGrid title="Gợi ý riêng cho bạn" />
      
      {/* Brands Banner */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl text-center border-t border-gray-100 pt-16">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-12 uppercase tracking-widest">
            Thương Hiệu Chính Hãng
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="text-2xl md:text-4xl font-black tracking-tighter">L'ORÉAL</div>
            <div className="text-2xl md:text-4xl font-black tracking-widest">VICHY</div>
            <div className="text-2xl md:text-4xl font-black">MAYBELLINE</div>
            <div className="text-2xl md:text-4xl font-bold font-serif">Eucerin</div>
            <div className="text-2xl md:text-4xl font-black tracking-tight">LA ROCHE-POSAY</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
