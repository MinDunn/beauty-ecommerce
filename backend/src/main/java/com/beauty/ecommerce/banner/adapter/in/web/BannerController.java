package com.beauty.ecommerce.banner.adapter.in.web;

import com.beauty.ecommerce.banner.adapter.out.persistence.BannerJpaEntity;
import com.beauty.ecommerce.banner.adapter.out.persistence.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerRepository bannerRepository;

    // API cho nguoi dung xem ngoai trang chu
    @GetMapping
    public ResponseEntity<List<BannerJpaEntity>> getActiveBanners() {
        return ResponseEntity.ok(bannerRepository.findByIsActiveOrderByDisplayOrderAsc(true));
    }

    // API cho Admin quan ly tat ca banner
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BannerJpaEntity>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAll());
    }

    // API cho Admin cap nhat link anh hoac thong tin banner
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerJpaEntity> updateBanner(@PathVariable Long id, @RequestBody BannerJpaEntity request) {
        return ResponseEntity.ok(bannerRepository.findById(id)
                .map(banner -> {
                    banner.setImageUrl(request.getImageUrl());
                    banner.setTitle(request.getTitle());
                    banner.setCampaign(request.getCampaign());
                    banner.setSubtitle(request.getSubtitle());
                    banner.setActive(request.isActive());
                    banner.setDisplayOrder(request.getDisplayOrder());
                    return bannerRepository.save(banner);
                })
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id)));
    }
    
    // API cho Admin them banner moi bang link URL
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerJpaEntity> createBanner(@RequestBody BannerJpaEntity banner) {
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    // API cho Admin xoa banner
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
