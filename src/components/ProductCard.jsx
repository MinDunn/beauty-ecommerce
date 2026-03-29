import { Link } from "react-router-dom";
import "../styles.css";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <div className="image-box">
        <img src={product.image} alt={product.name} />

        {product.isSale && <span className="badge sale">Giảm giá</span>}
        {product.isHot && <span className="badge hot">Hot</span>}
      </div>

      <h3>{product.name}</h3>

      <div>
        <span className="old">
          {product.price.toLocaleString("vi-VN")} đ
        </span>
        <span className="new">
          {product.salePrice.toLocaleString("vi-VN")} đ
        </span>
      </div>
    </Link>
  );
}
