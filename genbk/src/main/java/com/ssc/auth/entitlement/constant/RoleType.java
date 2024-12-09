package com.ssc.auth.entitlement.constant;

/**
 * Enum for role types
 */
public enum RoleType {
    OWNER("OWNER"),
    DEVELOPER("DEVELOPER"),
    VIEWER("VIEWER");

    private final String value;

    RoleType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RoleType fromString(String value) {
        for (RoleType type : RoleType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown role type: " + value);
    }
} 