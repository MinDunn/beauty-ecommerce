import { useState } from "react";
import type { Order } from "../types";
import { Table } from "../components/admin/Table";

export const Orders = () => {
  const [orders] = useState<Order[]>([]);

  return <Table columns={["Khách hàng", "Tổng tiền", "Trạng thái", "Ngày"]} data={orders} />;
};