package com.ssc.auth.entitlement.exception;

import com.ssc.common.exception.BaseException;
import com.ssc.common.exception.ErrorCode;

public class UserException extends BaseException {
    public UserException(ErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }
} 