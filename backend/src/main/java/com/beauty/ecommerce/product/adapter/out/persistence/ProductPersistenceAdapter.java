package com.beauty.ecommerce.product.adapter.out.persistence;

import com.beauty.ecommerce.product.application.port.out.LoadProductPort;
import com.beauty.ecommerce.product.domain.entity.Product;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class ProductPersistenceAdapter implements LoadProductPort {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public List<Product> loadAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::mapToDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Product> loadProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::mapToDomainEntity);
    }
}
