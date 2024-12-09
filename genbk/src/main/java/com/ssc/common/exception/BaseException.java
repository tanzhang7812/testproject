package com.ssc.common.exception;

import lombok.Getter;

@Getter
public class BaseException extends RuntimeException {
    private final String code;
    private final String message;

    public BaseException(ErrorCode errorCode, Object... args) {
        super(errorCode.getMessage(args));
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage(args);
    }
} 