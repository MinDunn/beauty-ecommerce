package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.product.application.port.in.GetProductUseCase;
import com.beauty.ecommerce.product.application.port.out.LoadProductPort;
import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ProductReaderService implements GetProductUseCase {

    private final LoadProductPort loadProductPort;

    @Override
    public List<Product> getAllProducts() {
        return loadProductPort.loadAllProducts();
    }

    @Override
    public Product getProductById(Long id) {
        return loadProductPort.loadProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
}
