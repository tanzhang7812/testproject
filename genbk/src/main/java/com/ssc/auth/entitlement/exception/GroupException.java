package com.ssc.auth.entitlement.exception;

import com.ssc.common.exception.BaseException;
import com.ssc.common.exception.ErrorCode;

public class GroupException extends BaseException {
    public GroupException(ErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }
} 