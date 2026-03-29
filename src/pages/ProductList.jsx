import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  // Lấy query từ URL
  const [params] = useSearchParams();

  const tuKhoa = params.get("q") || "";
  const sapXep = params.get("sort") || "";

  // Lọc theo tên sản phẩm
  let danhSach = products.filter((sp) =>
    sp.name.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  // Sắp xếp
  if (sapXep === "gia-tang") {
    danhSach.sort((a, b) => a.salePrice - b.salePrice);
  }

  if (sapXep === "gia-giam") {
    danhSach.sort((a, b) => b.salePrice - a.salePrice);
  }

  return (
    <div className="layout">
      {/* Cột trái */}
      <div className="sidebar">
        <h3>Bộ lọc</h3>

        <p>Tìm kiếm:</p>
        <p>?q=son</p>

        <p>Sắp xếp:</p>
        <p>?sort=gia-tang</p>
        <p>?sort=gia-giam</p>
      </div>

      {/* Cột phải */}
      <div className="content">
        <h2>Danh sách sản phẩm</h2>

        <div className="grid">
          {danhSach.length > 0 ? (
            danhSach.map((sp) => (
              <ProductCard key={sp.id} product={sp} />
            ))
          ) : (
            <p>Không tìm thấy sản phẩm</p>
          )}
        </div>
      </div>
    </div>
  );
}
