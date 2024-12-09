package com.ssc.auth.entitlement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "GEN_OPERATIONAPPROVAL")
@EqualsAndHashCode(callSuper = true)
public class OperationApproval extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_id")
    private Long approvalId;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @Column(name = "operation_type")
    private String operationType;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "status")
    private String status;

    @Column(name = "request_time")
    private LocalDateTime requestTime;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;
} 