import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckTables {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/beauty_ecommerce_prod?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "er5u1JAS4hp5cbx.root";
        String password = "YODKvDna5B2aQlze";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("--- KẾT QUẢ KIỂM TRA DATABASE CHUNG ---");
            ResultSet rs = stmt.executeQuery("SHOW TABLES");
            
            boolean found = false;
            while (rs.next()) {
                System.out.println("Found Table: " + rs.getString(1));
                found = true;
            }
            
            if (!found) {
                System.out.println("Database CONNECTED but NO TABLES found yet.");
            } else {
                System.out.println("--- KẾT LUẬN: ĐÃ SỬ DỤNG DB CHUNG THÀNH CÔNG! ---");
            }
            
        } catch (Exception e) {
            System.err.println("--- LỖI KẾT NỐI: ---");
            e.printStackTrace();
        }
    }
}
