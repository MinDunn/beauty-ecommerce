package com.beauty.ecommerce.product.application.port.out;

public interface UpdateProductStockPort {
    void updateStock(Long productId, Integer quantity);
    void restoreStock(Long productId, Integer quantity);
}
