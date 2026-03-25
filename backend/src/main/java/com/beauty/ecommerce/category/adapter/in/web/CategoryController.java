package com.beauty.ecommerce.category.adapter.in.web;

import com.beauty.ecommerce.category.adapter.in.web.request.CategoryRequest;
import com.beauty.ecommerce.category.adapter.in.web.response.CategoryResponse;
import com.beauty.ecommerce.category.application.service.CategoryService;
import com.beauty.ecommerce.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        log.info("Yêu cầu lấy tất cả danh mục hiển thị lên menu");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/admin/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("Admin đang tạo danh mục mới: {}", request.getName());
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo danh mục thành công", response));
    }

    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        log.info("Admin đang cập nhật danh mục ID: {}", id);
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", response));
    }

    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        log.info("Admin đang xóa danh mục ID: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}
