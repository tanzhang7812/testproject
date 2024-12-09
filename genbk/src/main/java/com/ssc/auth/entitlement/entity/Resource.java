package com.ssc.auth.entitlement.entity;

import com.ssc.auth.entitlement.entity.enums.OwnerType;
import com.ssc.auth.entitlement.entity.enums.ResourceType;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "GEN_RESOURCE")
@EqualsAndHashCode(callSuper = true)
public class Resource extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "owner_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private OwnerType ownerType;

    @Column(name = "owner_id")
    private Long ownerId;
} 