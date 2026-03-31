package com.beauty.ecommerce.product.application.port.in;

import com.beauty.ecommerce.product.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

public interface GetProductUseCase {
    Page<Product> getAllProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword, String sortBy, Pageable pageable);
    Product getProductById(Long id);
}
