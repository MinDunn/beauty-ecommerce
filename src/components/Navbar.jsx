import { Link } from "react-router-dom";

export default function Navbar() {
  const navStyle = {
    backgroundColor: "#333",
    color: "white",
    padding: "1rem",
    marginBottom: "1rem",
    display: "flex",
    gap: "20px"
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>Trang chủ</Link>
      <Link to="/products" style={linkStyle}>Sản phẩm</Link>
    </nav>
  );
}
