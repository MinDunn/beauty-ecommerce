package com.beauty.ecommerce.order.adapter.out.persistence;

import com.beauty.ecommerce.order.adapter.out.persistence.mapper.OrderMapper;
import com.beauty.ecommerce.order.application.port.out.OrderPort;
import com.beauty.ecommerce.order.domain.entity.Order;
import com.beauty.ecommerce.order.domain.entity.OrderStatus;
import com.beauty.ecommerce.order.domain.entity.PaymentStatus;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductJpaEntity;
import com.beauty.ecommerce.product.adapter.out.persistence.ProductRepository;
import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import com.beauty.ecommerce.user.adapter.out.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderPort {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public Order save(Order order) {
        UserJpaEntity user = userRepository.findById(order.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrderJpaEntity orderJpaEntity = OrderJpaEntity.builder()
                .user(user)
                .orderDate(order.getOrderDate())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null)
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .cancelReason(order.getCancelReason())
                .vatRequested(order.isVatRequested())
                .taxCode(order.getTaxCode())
                .companyName(order.getCompanyName())
                .companyAddress(order.getCompanyAddress())
                .build();

        List<OrderItemJpaEntity> itemEntities = order.getItems().stream()
                .map(item -> {
                    ProductJpaEntity product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found"));
                    return OrderItemJpaEntity.builder()
                            .order(orderJpaEntity)
                            .product(product)
                            .quantity(item.getQuantity())
                            .price(item.getPrice())
                            .variantName(item.getVariantName())
                            .build();
                })
                .collect(Collectors.toList());

        orderJpaEntity.setItems(itemEntities);
        OrderJpaEntity savedOrder = orderRepository.save(orderJpaEntity);
        return orderMapper.mapToDomainEntity(savedOrder);
    }

    @Override
    public List<Order> findByUserEmail(String email) {
        return orderRepository.findByUserEmailOrderByOrderDateDesc(email).stream()
                .map(orderMapper::mapToDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findAll() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(orderMapper::mapToDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Order> findAll(String query, OrderStatus status, Pageable pageable) {
        Specification<OrderJpaEntity> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status.name()));
            }
            
            if (query != null && !query.trim().isEmpty()) {
                String search = "%" + query.toLowerCase().trim() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("id").as(String.class)), search),
                    cb.like(cb.lower(root.get("receiverName")), search),
                    cb.like(cb.lower(root.get("receiverPhone")), search)
                ));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return orderRepository.findAll(spec, pageable).map(orderMapper::mapToDomainEntity);
    }

    @Override
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id).map(orderMapper::mapToDomainEntity);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, OrderStatus status) {
        OrderJpaEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status != null ? status.name() : null);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void updatePaymentStatus(Long id, PaymentStatus status) {
        OrderJpaEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentStatus(status != null ? status.name() : null);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void updatePaymentTransactionId(Long id, String transId) {
        OrderJpaEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentTransactionId(transId);
        orderRepository.save(order);
    }
}
