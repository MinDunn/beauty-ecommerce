package com.beauty.ecommerce.product.application.port.in;

import com.beauty.ecommerce.product.domain.entity.Product;
import java.util.List;

public interface GetProductUseCase {
    List<Product> getAllProducts();
    Product getProductById(Long id);
}
