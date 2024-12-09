package com.ssc.auth.entitlement.constant;

/**
 * Constants for operation approval management
 */
public final class OperationApprovalConstants {
    // Approval status
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_APPROVED = "approved";
    public static final String STATUS_REJECTED = "rejected";

    // Error messages
    public static final String ERROR_APPROVAL_NOT_FOUND = "Approval not found";
    public static final String ERROR_APPROVAL_NOT_NEEDED = "Operation doesn't need approval";
    public static final String ERROR_GROUP_RESOURCE_ONLY = "Only group resources need approval";
    public static final String ERROR_APPROVER_NOT_FOUND = "Approver not found in group";
    public static final String ERROR_ALREADY_PROCESSED = "Approval already processed";

    private OperationApprovalConstants() {
        // Private constructor to prevent instantiation
    }
} 