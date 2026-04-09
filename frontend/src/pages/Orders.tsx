import { useState } from "react";
import { Order } from "../types";
import { Table } from "../components/admin/Table";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  return <Table columns={["Khách hàng", "Tổng tiền", "Trạng thái", "Ngày"]} data={orders} />;
};