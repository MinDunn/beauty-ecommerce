package com.beauty.ecommerce.common.application.service;

import com.beauty.ecommerce.common.adapter.out.persistence.SystemSettingJpaEntity;
import com.beauty.ecommerce.common.adapter.out.persistence.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository repository;

    public String getSetting(String key, String defaultValue) {
        return repository.findByKey(key)
                .map(SystemSettingJpaEntity::getValue)
                .orElse(defaultValue);
    }

    public Map<String, String> getSettings(List<String> keys) {
        return repository.findAll().stream()
                .filter(s -> keys.contains(s.getKey()))
                .collect(Collectors.toMap(SystemSettingJpaEntity::getKey, SystemSettingJpaEntity::getValue));
    }

    public List<SystemSettingJpaEntity> getAllSettings() {
        return repository.findAll();
    }

    @Transactional
    public void updateSetting(String key, String value) {
        SystemSettingJpaEntity setting = repository.findByKey(key)
                .orElse(SystemSettingJpaEntity.builder()
                        .key(key)
                        .build());
        setting.setValue(value);
        repository.save(setting);
    }
}
