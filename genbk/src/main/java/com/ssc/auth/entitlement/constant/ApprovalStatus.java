package com.ssc.auth.entitlement.constant;

/**
 * Enum for approval status
 */
public enum ApprovalStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected");

    private final String value;

    ApprovalStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ApprovalStatus fromString(String value) {
        for (ApprovalStatus status : ApprovalStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown approval status: " + value);
    }
} 