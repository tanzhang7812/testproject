package com.ssc.auth.entitlement.constant;

/**
 * Enum for operation types
 */
public enum OperationType {
    DELETE("delete"),
    PUBLISH("publish"),
    UPDATE("update"),
    VIEW("view");

    private final String value;

    OperationType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OperationType fromString(String value) {
        for (OperationType type : OperationType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown operation type: " + value);
    }
} 