import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class CreateDatabase {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "er5u1JAS4hp5cbx.root";
        String password = "YODKvDna5B2aQlze";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Connecting to TiDB Cloud...");
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS beauty_ecommerce_prod");
            System.out.println("Database 'beauty_ecommerce_prod' created successfully!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
