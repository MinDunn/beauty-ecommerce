package com.beauty.ecommerce.product.application.port.out;

import com.beauty.ecommerce.product.domain.entity.Product;
import java.util.List;
import java.util.Optional;

public interface LoadProductPort {
    List<Product> loadAllProducts();
    Optional<Product> loadProductById(Long id);
}
