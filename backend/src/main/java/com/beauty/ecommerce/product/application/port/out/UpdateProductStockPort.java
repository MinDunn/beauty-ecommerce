package com.beauty.ecommerce.product.application.port.out;

public interface UpdateProductStockPort {
    void updateStock(Long productId, Integer quantity, String variantName);
    void restoreStock(Long productId, Integer quantity, String variantName);
}
