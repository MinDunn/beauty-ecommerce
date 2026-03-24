# Beauty E-commerce System (MinDunn)

Hệ thống thương mại điện tử chuyên cung cấp mỹ phẩm và các sản phẩm chăm sóc sắc đẹp, được xây dựng với kiến trúc hiện đại, bảo mật và hiệu năng cao.

## 🚀 Công nghệ sử dụng

### Backend (Java Spring Boot)
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT (JSON Web Token)
- **Database:** MySQL
- **ORM:** Spring Data JPA
- **Logging:** SLF4J + Lombok
- **Architecture:** Modular Monolith / Hexagonal Architecture

### Frontend (React)
- **Framework:** React + Vite
- **Styling:** Vanilla CSS / Tailwind (Tùy chọn)
- **State Management:** Redux Toolkit / Context API
- **HTTP Client:** Axios

## ✨ Tính năng chính

### 👤 Xác thực & Người dùng (Dũng - Lead)
- Đăng ký & Đăng nhập bảo mật với BCrypt.
- **Cơ chế Refresh Token:** Tự động duy trì phiên đăng nhập mà không cần login lại.
- Profile người dùng và Phân quyền (User/Admin).
- Tích hợp SLF4J Logging để giám sát hệ thống.

### 🛍️ Sản phẩm & Danh mục (Nhật Anh)
- Quản lý danh mục sản phẩm (Categories).
- Tìm kiếm, lọc sản phẩm theo giá và sắp xếp linh hoạt.
- Quản lý kho hàng và hình ảnh sản phẩm.

### 🛒 Giỏ hàng & Đặt hàng (Bảo)
- Giỏ hàng cá nhân (Cart).
- Quy trình Checkout chuyên nghiệp, trừ tồn kho và tạo đơn hàng.
- Lịch sử mua hàng và quản lý trạng thái đơn hàng (Admin).

### 💬 Tương tác & Phản hồi (Dũng)
- Hệ thống đánh giá sản phẩm (Reviews) 1-5 sao.
- Chat/Feedback từ khách hàng tới Admin (Contact Flow).

## 🛠️ Cài đặt & Chạy ứng dụng

### 1. Yêu cầu hệ thống
- JDK 17+
- MySQL 8.0+
- Node.js 18+ & npm

### 2. Cấu hình Backend
Tạo database MySQL và cấu hình các biến môi trường sau (hoặc sửa trực tiếp trong `application.yml`):
- `DB_URL`: JDBC URL (ví dụ: `jdbc:mysql://localhost:3306/beauty_db`)
- `DB_USERNAME`: Tài khoản DB
- `DB_PASSWORD`: Mật khẩu DB
- `JWT_SECRET`: Khóa bí mật JWT

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 3. Cấu hình Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Bảo mật & Hạ tầng
- **Environment Variables:** Mọi thông tin nhạy cảm được cấu hình qua biến môi trường.
- **Global Exception Handling:** Xử lý lỗi tập trung, ẩn chi tiết lỗi hệ thống để bảo mật thông tin.
- **Audit:** Dữ liệu được bảo vệ bằng cơ chế Transaction và các ràng buộc DB (Unique, Check constraints).

---
© 2026 Beauty E-commerce Project - Developed by Team MinDunn.