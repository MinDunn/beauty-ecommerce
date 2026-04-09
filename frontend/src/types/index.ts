export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
};

export type Order = {
  id: number;
  customer: string;
  total: number;
  status: string;
  date: string;
};

export type Feedback = {
  id: number;
  name: string;
  email: string;
  message: string;
  date: string;
  read?: boolean;
};