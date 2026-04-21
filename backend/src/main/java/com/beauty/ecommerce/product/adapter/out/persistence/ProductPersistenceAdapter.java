package com.beauty.ecommerce.product.adapter.out.persistence;

import com.beauty.ecommerce.inventory.application.service.InventoryService;
import com.beauty.ecommerce.product.application.port.out.LoadProductPort;
import com.beauty.ecommerce.product.application.port.out.SaveProductPort;
import com.beauty.ecommerce.product.application.port.out.UpdateProductStockPort;
import com.beauty.ecommerce.product.application.port.out.DeleteProductPort;
import com.beauty.ecommerce.product.domain.entity.Product;
import com.beauty.ecommerce.product.adapter.out.persistence.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class ProductPersistenceAdapter implements LoadProductPort, UpdateProductStockPort, SaveProductPort, DeleteProductPort {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    @Lazy
    private final InventoryService inventoryService;

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

    @Override
    public void updateStock(Long productId, Integer quantity) {
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Not enough stock for product: " + product.getName());
        }
        
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
        
        // Sync Expiry Date (FEFO) after stock reduction
        inventoryService.syncProductExpiryDate(productId);
    }

    @Override
    public void restoreStock(Long productId, Integer quantity) {
        ProductJpaEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
        
        // Sync Expiry Date (FEFO) after stock restore
        inventoryService.syncProductExpiryDate(productId);
    }

    @Override
    public Product saveProduct(Product product) {
        ProductJpaEntity entity = productMapper.mapToJpaEntity(product);
        ProductJpaEntity savedEntity = productRepository.save(entity);
        return productMapper.mapToDomainEntity(savedEntity);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public ProductJpaEntity loadJpaEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
