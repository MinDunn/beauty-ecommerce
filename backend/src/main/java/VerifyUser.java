import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class VerifyUser {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/beauty_ecommerce_prod?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "er5u1JAS4hp5cbx.root";
        String password = "YODKvDna5B2aQlze";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("--- ĐANG CẬP NHẬT ẢNH SẢN PHẨM TRÊN CLOUD ---");
            int rows = stmt.executeUpdate(
                "UPDATE products SET image_url = CONCAT(image_url, '?auto=format&fit=crop&w=600&q=80') " +
                "WHERE image_url LIKE 'https://images.unsplash.com/%' AND image_url NOT LIKE '%?%'"
            );
            System.out.println("Đã cập nhật " + rows + " sản phẩm.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
