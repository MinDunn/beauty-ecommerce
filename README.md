# Beauty E-commerce System (MinDunn)

Hệ thống thương mại điện tử chuyên cung cấp mỹ phẩm và các sản phẩm chăm sóc sắc đẹp cao cấp. Dự án được phát triển với mục tiêu xây dựng một nền tảng mua sắm hiện đại, bảo mật và tối ưu hóa trải nghiệm người dùng.

---

## 🚀 Công nghệ sử dụng (Tech Stack)

### Backend (Java Spring Boot)
- **Framework:** Spring Boot 3.x (Java 17)
- **Security:** Spring Security + JWT (Json Web Token) với cơ chế Refresh Token.
- **Database:** TiDB Cloud (MySQL compatible, Serverless/Dedicated)
- **ORM:** Spring Data JPA (Hibernate)
- **Logging:** SLF4J + Lombok
- **API Documentation:** Swagger/OpenAPI (Tích hợp sẵn)

### Frontend (React)
- **Library:** React 19 + Vite (Siêu nhanh)
- **Styling:** Tailwind CSS + Vanilla CSS (Aesthetics cao cấp)
- **Animation:** Framer Motion (Hiệu ứng mượt mà)
- **State Management:** Redux Toolkit (@reduxjs/toolkit)
- **Routing:** React Router v7
- **Form:** React Hook Form + Zod (Validation chặt chẽ)
- **Icons:** Lucide React

### Infrastructure & DevTools
- **Containerization:** Docker & Docker Compose
- **Build Tool:** Maven (Backend), NPM (Frontend)
- **Version Control:** Git

---

## ✨ Tính năng chính (Key Features)

### 👤 Xác thực & Phân quyền (Authentication & Authorization)
- Đăng ký tài khoản và Đăng nhập bảo mật (BCrypt).
- Phân quyền người dùng: **USER** (Khách hàng) và **ADMIN** (Quản trị viên).
- Cấu trúc bảo mật JWT: Access Token ngắn hạn và Refresh Token dài hạn.

### 🛍️ Quản lý Sản phẩm & Danh mục
- Duyệt sản phẩm theo danh mục (Skincare, Makeup, Haircare, Beauty...).
- Tìm kiếm sản phẩm thông minh, lọc theo giá và thương hiệu.
- Trang chi tiết sản phẩm với đầy đủ thông tin, hình ảnh và gợi ý.

### 🛒 Giỏ hàng & Thanh toán
- Quản lý giỏ hàng (Thêm, sửa, xóa, cập nhật số lượng).
- Quy trình Thanh toán (Checkout) chuyên nghiệp.
- Tự động kiểm tra và trừ tồn kho khi đặt hàng thành công.

### 📊 Trang Quản trị (Admin Dashboard)
- Quản lý danh sách sản phẩm (Thêm mới, cập nhật thông tin, hình ảnh).
- Quản lý đơn hàng và trạng thái đơn hàng.
- Theo dõi ý kiến phản hồi và đánh giá từ khách hàng.

### 💬 Tương tác khách hàng
- Hệ thống đánh giá (Rating) & Bình luận sản phẩm.
- Form liên hệ (Contact) và gửi yêu cầu hỗ trợ tới hệ thống.

---

## 🔑 Tài khoản thử nghiệm (Test Accounts)

Bạn có thể sử dụng các tài khoản sau để kiểm tra các tính năng phân quyền:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@beauty.com` | `admin123` |
| **Khách hàng (User)** | `user@beauty.com` | `user123` (Cần đăng ký) |

## 🔗 Đường dẫn truy cập (Access URLs)

| Thành phần | URL công cộng | Cổng mặc định |
| :--- | :--- | :--- |
| **Frontend (Giao diện)** | `http://localhost:5173` | `5173` |
| **Backend (API)** | `http://localhost:8080` | `8080` |
| **Swagger UI (Docs)** | `http://localhost:8080/swagger-ui/index.html` | - |

---

## 🛠️ Cài đặt & Chạy ứng dụng (Installation)

### 1. Yêu cầu hệ thống (Prerequisites)
- [Node.js 18+](https://nodejs.org/)
- [Java JDK 17+](https://adoptium.net/)
- [Docker](https://www.docker.com/) (Tùy chọn, dùng để chạy nhanh MySQL)

### 2. Cấu hình Biến môi trường
Dự án sử dụng file `.env` ở thư mục gốc để quản lý cấu hình kết nối tới TiDB Cloud:
```env
DB_URL=jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/beauty_ecommerce_prod?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
DB_USERNAME=your_tidb_user
DB_PASSWORD=your_tidb_password
JWT_SECRET=your_long_secret_key
```

### 3. Khởi chạy với Docker
Sử dụng Docker Compose để tạo môi trường cho Backend và Frontend:
```bash
docker-compose up -d
```
*Lưu ý: Local MySQL đã được gỡ bỏ khỏi docker-compose.yml vì hệ thống hiện đã chuyển sang sử dụng TiDB Cloud.*

### 4. Khởi chạy Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 5. Khởi chạy Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Cấu trúc thư mục (Project Structure)

```text
beauty-ecommerce/
├── backend/            # Spring Boot Maven Project
│   ├── src/main/java/  # Layered Architecture (Controller, Service, Repository, Entity)
│   └── pom.xml         # Backend dependencies
├── frontend/           # Vite React Project
│   ├── src/            # Components, Pages, Store (Redux), Assets
│   └── package.json    # Frontend dependencies
├── docker-compose.yml  # Database orchestration
├── .env                # Global configuration
└── README.md           # Documentation
```

---

## 👥 Đội ngũ phát triển (Development Team)

- **Dũng (Lead):** Chịu trách nhiệm Security (JWT), Refresh Token, Auth Flow và Hệ thống Feedback.
- **Nhật Anh:** Chụp trách nhiệm Module Sản phẩm và Danh mục (Category/Product).
- **Bảo:** Chụp trách nhiệm Module Giỏ hàng và Luồng đặt hàng (Cart/Checkout).

---

© 2026 **Beauty E-commerce Project**. Được xây dựng với niềm đam mê công nghệ và làm đẹp.