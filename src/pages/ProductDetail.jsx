import { useParams } from "react-router-dom";
import products from "../data/products";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const sp = products.find((p) => p.id == id);

  const [soLuong, setSoLuong] = useState(1);

  if (!sp) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <div>
      <img src={sp.image} width="300" />

      <h2>{sp.name}</h2>

      <p>Giá: {sp.salePrice.toLocaleString("vi-VN")} đ</p>

      <div>
        <button onClick={() => setSoLuong(Math.max(1, soLuong - 1))}>
          -
        </button>
        <span> {soLuong} </span>
        <button onClick={() => setSoLuong(soLuong + 1)}>
          +
        </button>
      </div>

      <button>Thêm vào giỏ hàng</button>

      <h3>Đánh giá</h3>
      <p>⭐⭐⭐⭐☆</p>

      <h4>Bình luận</h4>
      <p>Chưa có bình luận</p>
    </div>
  );
}
