package com.ssc.auth.entitlement.constant;

/**
 * Constants for resource management
 */
public final class ResourceConstants {
    // Role names
    public static final String ROLE_OWNER = "OWNER";
    public static final String ROLE_DEVELOPER = "DEVELOPER";
    public static final String ROLE_VIEWER = "VIEWER";

    // Operation types
    public static final String OPERATION_DELETE = "delete";
    public static final String OPERATION_PUBLISH = "publish";
    public static final String OPERATION_UPDATE = "update";
    public static final String OPERATION_VIEW = "view";

    // Error messages
    public static final String ERROR_RESOURCE_NOT_FOUND = "Resource not found";
    public static final String ERROR_USER_NOT_FOUND = "User not found";
    public static final String ERROR_USER_NOT_IN_GROUP = "User not found in group";
    public static final String ERROR_NO_PERMISSION = "No permission for this operation";
    public static final String ERROR_OWNER_ONLY = "Only owner can perform this operation";
    public static final String ERROR_DELETE_PERMISSION = "No permission to delete this resource";
    public static final String ERROR_UPDATE_PERMISSION = "No permission to update this resource";
    public static final String ERROR_PUBLISH_PERMISSION = "No permission to publish this resource";

    private ResourceConstants() {
        // Private constructor to prevent instantiation
    }
} 