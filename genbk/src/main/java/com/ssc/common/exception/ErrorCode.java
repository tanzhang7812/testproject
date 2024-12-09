package com.ssc.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // System errors (1000-1999)
    SYSTEM_ERROR("1000", "System error"),
    INVALID_PARAMETER("1001", "Invalid parameter"),
    
    // User errors (2000-2999)
    USER_NOT_FOUND("2000", "User not found: %s"),
    USER_ALREADY_EXISTS("2001", "User already exists: %s"),
    USER_NOT_IN_GROUP("2002", "User not found in group: %s"),
    
    // Group errors (3000-3999)
    GROUP_NOT_FOUND("3000", "Group not found: %s"),
    GROUP_NAME_EXISTS("3001", "Group name already exists: %s"),
    USER_ALREADY_IN_GROUP("3002", "User already exists in group: %s"),
    
    // Resource errors (4000-4999)
    RESOURCE_NOT_FOUND("4000", "Resource not found: %s"),
    RESOURCE_NO_PERMISSION("4001", "No permission for this operation"),
    RESOURCE_DELETE_DENIED("4002", "No permission to delete this resource: %s"),
    RESOURCE_UPDATE_DENIED("4003", "No permission to update this resource: %s"),
    RESOURCE_PUBLISH_DENIED("4004", "No permission to publish this resource: %s"),
    RESOURCE_OWNER_ONLY("4005", "Only owner can perform this operation"),
    
    // Approval errors (5000-5999)
    APPROVAL_NOT_FOUND("5000", "Approval not found: %s"),
    APPROVAL_ALREADY_PROCESSED("5001", "Approval already processed"),
    APPROVAL_NOT_NEEDED("5002", "Operation doesn't need approval"),
    APPROVAL_NO_PERMISSION("5003", "No permission to approve/reject"),
    APPROVER_NOT_FOUND("5004", "Approver not found in group: %s");

    private final String code;
    private final String messageTemplate;

    ErrorCode(String code, String messageTemplate) {
        this.code = code;
        this.messageTemplate = messageTemplate;
    }

    public String getMessage(Object... args) {
        return String.format(messageTemplate, args);
    }
} 