package com.ssc.pipeline.entity;

import com.ssc.auth.entitlement.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "GEN_PIPELINE")
@EqualsAndHashCode(callSuper = true)
public class Pipeline extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PipelineStatus status;

    @Column(columnDefinition = "TEXT")
    private String configuration;
} 