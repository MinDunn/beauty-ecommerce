package com.beauty.ecommerce;
import org.junit.jupiter.api.Test;
import java.sql.*;

public class ProductQuery {
    @Test
    public void testDescribeTable() {
        String url = "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/beauty_ecommerce_prod?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "er5u1JAS4hp5cbx.root";
        String password = "YODKvDna5B2aQlze";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String query = "DESCRIBE products";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                System.out.println("--- TABLE STRUCTURE START ---");
                while (rs.next()) {
                    System.out.println(rs.getString("Field") + " | " + rs.getString("Type"));
                }
                System.out.println("--- TABLE STRUCTURE END ---");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
