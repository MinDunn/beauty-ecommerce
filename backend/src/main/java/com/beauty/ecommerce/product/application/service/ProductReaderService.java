package com.beauty.ecommerce.product.application.service;

import com.beauty.ecommerce.common.exception.ResourceNotFoundException;
import com.beauty.ecommerce.product.application.port.in.GetProductUseCase;
import com.beauty.ecommerce.product.application.port.out.LoadProductPort;
import com.beauty.ecommerce.product.domain.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
@Slf4j
public class ProductReaderService implements GetProductUseCase {

    private final LoadProductPort loadProductPort;

    @Override
    public List<Product> getAllProducts() {
        log.info("Đang lấy tất cả danh sách sản phẩm");
        return loadProductPort.loadAllProducts();
    }

    @Override
    public Product getProductById(Long id) {
        log.info("Đang lấy thông tin chi tiết sản phẩm ID: {}", id);
        return loadProductPort.loadProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
    }
}

