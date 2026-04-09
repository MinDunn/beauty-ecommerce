import { useState } from "react";
import { Product } from "../types";
import { Table } from "../components/admin/Table";
import { Modal } from "../components/admin/Modal";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="mb-4 bg-pink-500 text-white px-4 py-2 rounded">
        Thêm sản phẩm
      </button>

      <Table columns={["Tên", "Giá", "Danh mục", "Tồn kho"]} data={products} />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <input placeholder="Tên sản phẩm" className="border p-2 w-full mb-2" />
          <input placeholder="Giá" className="border p-2 w-full mb-2" />
          <select className="border p-2 w-full mb-2">
            <option>Chăm sóc da</option>
            <option>Trang điểm</option>
          </select>
          <input type="file" onChange={handleImage} />
          {preview && <img src={preview} className="mt-2 h-20" />}
        </Modal>
      )}
    </div>
  );
};