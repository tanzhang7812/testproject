package com.ssc.auth.entitlement.exception;

import com.ssc.common.exception.BaseException;
import com.ssc.common.exception.ErrorCode;

public class ResourceException extends BaseException {
    public ResourceException(ErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }
} 