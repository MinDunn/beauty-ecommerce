import products from "../data/products";
import ProductCard from "../components/ProductCard";
import BannerCarousel from "../components/BannerCarousel";

export default function Home() {
  return (
    <div>
      <BannerCarousel />

      <h2>Sản phẩm nổi bật</h2>
      <div className="grid">
        {products.slice(0, 4).map((sp) => (
          <ProductCard key={sp.id} product={sp} />
        ))}
      </div>

      <h2>Tất cả sản phẩm</h2>
      <div className="grid">
        {products.map((sp) => (
          <ProductCard key={sp.id} product={sp} />
        ))}
      </div>
    </div>
  );
}
