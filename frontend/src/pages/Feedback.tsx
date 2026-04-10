import { useState } from "react";
import type { Feedback } from "../types";
import { Table } from "../components/admin/Table";

export const FeedbackPage = () => {
  const [feedbacks] = useState<Feedback[]>([]);

  return <Table columns={["Tên", "Email", "Nội dung", "Ngày"]} data={feedbacks} />;
};