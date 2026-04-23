package com.beauty.ecommerce.order.adapter.out.persistence;

import com.beauty.ecommerce.user.adapter.out.persistence.UserJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserJpaEntity user;

    @Column(name = "order_date")
    @Builder.Default
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "shipping_fee")
    private BigDecimal shippingFee;

    @Column(name = "status")
    private String status;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "receiver_name")
    private String receiverName;

    @Column(name = "receiver_phone")
    private String receiverPhone;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "province")
    private String province;

    @Column(name = "payment_transaction_id")
    private String paymentTransactionId;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "vat_requested")
    @Builder.Default
    private boolean vatRequested = false;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_address")
    private String companyAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItemJpaEntity> items;
}
