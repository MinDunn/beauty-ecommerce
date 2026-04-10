package com.beauty.ecommerce.product.application.port.out;

import com.beauty.ecommerce.product.domain.entity.Product;

public interface SaveProductPort {
    Product saveProduct(Product product);
}
