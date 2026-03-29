import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const [params] = useSearchParams();

  const tuKhoa = params.get("q") || "";
  const sapXep = params.get("sort");

  let list = products.filter((sp) =>
    sp.name.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  if (sapXep === "gia-tang") {
    list.sort((a, b) => a.salePrice - b.salePrice);
  }

  if (sapXep === "gia-giam") {
    list.sort((a, b) => b.salePrice - a.salePrice);
  }

  return (
    <div className="layout">
      <div className="sidebar">
        <h3>Bộ lọc</h3>
        <p>Tìm kiếm: ?q=son</p>
        <p>Sắp xếp: ?sort=gia-tang</p>
      </div>

      <div className="content">
        <h2>Danh sách sản phẩm</h2>

        <div className="grid">
          {list.map((sp) => (
            <ProductCard key={sp.id} product={sp} />
          ))}
        </div>
      </div>
    </div>
  );
}
