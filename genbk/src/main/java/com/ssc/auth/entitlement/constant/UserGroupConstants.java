package com.ssc.auth.entitlement.constant;

/**
 * Constants for user group management
 */
public final class UserGroupConstants {
    // Error messages
    public static final String ERROR_USER_NOT_FOUND = "User not found";
    public static final String ERROR_GROUP_NOT_FOUND = "Group not found";
    public static final String ERROR_ROLE_NOT_FOUND = "Role not found";
    public static final String ERROR_USER_NOT_IN_GROUP = "User not found in group";
    public static final String ERROR_USER_ALREADY_IN_GROUP = "User already exists in group";
    public static final String ERROR_GROUP_NAME_EXISTS = "Group name already exists";

    private UserGroupConstants() {
        // Private constructor to prevent instantiation
    }
} 