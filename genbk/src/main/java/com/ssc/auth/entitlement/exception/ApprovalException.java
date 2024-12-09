package com.ssc.auth.entitlement.exception;

import com.ssc.common.exception.BaseException;
import com.ssc.common.exception.ErrorCode;

public class ApprovalException extends BaseException {
    public ApprovalException(ErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }
} 