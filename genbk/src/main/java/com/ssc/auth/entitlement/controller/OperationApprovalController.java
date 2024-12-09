package com.ssc.auth.entitlement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ssc.auth.entitlement.entity.OperationApproval;
import com.ssc.auth.entitlement.service.OperationApprovalService;

import java.util.List;

@Tag(name = "Operation Approval", description = "APIs for operation approval management")
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class OperationApprovalController {
    private final OperationApprovalService operationApprovalService;

    @Operation(
        summary = "Create Approval Request",
        description = "Create an approval request for resource operation"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Approval request created successfully",
        content = @Content(schema = @Schema(implementation = OperationApproval.class))
    )
    @PostMapping("/resources/{resourceId}")
    public ResponseEntity<OperationApproval> createApproval(
            @Parameter(description = "Resource ID") @PathVariable Long resourceId,
            @Parameter(description = "Operation type (delete/publish)") @RequestParam String operationType,
            @Parameter(description = "Requester user ID") @RequestParam Long requestUserId) {
        return ResponseEntity.ok(
            operationApprovalService.createApproval(resourceId, operationType, requestUserId)
        );
    }

    @Operation(
        summary = "Approve Operation",
        description = "Approve an operation request"
    )
    @ApiResponse(responseCode = "200", description = "Operation approved successfully")
    @PostMapping("/{approvalId}/approve")
    public ResponseEntity<Void> approveOperation(
            @Parameter(description = "Approval ID") @PathVariable Long approvalId,
            @Parameter(description = "Approver user ID") @RequestParam Long approverUserId) {
        operationApprovalService.approveOperation(approvalId, approverUserId);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Reject Operation",
        description = "Reject an operation request"
    )
    @ApiResponse(responseCode = "200", description = "Operation rejected successfully")
    @PostMapping("/{approvalId}/reject")
    public ResponseEntity<Void> rejectOperation(
            @Parameter(description = "Approval ID") @PathVariable Long approvalId,
            @Parameter(description = "Approver user ID") @RequestParam Long approverUserId) {
        operationApprovalService.rejectOperation(approvalId, approverUserId);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Get Pending Approvals",
        description = "Get all pending approval requests for a resource"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved pending approval list",
        content = @Content(schema = @Schema(implementation = OperationApproval.class))
    )
    @GetMapping("/resources/{resourceId}/pending")
    public ResponseEntity<List<OperationApproval>> getPendingApprovals(
            @Parameter(description = "Resource ID") @PathVariable Long resourceId) {
        return ResponseEntity.ok(operationApprovalService.findPendingApprovals(resourceId));
    }

    @Operation(
        summary = "Get User Requests",
        description = "Get all approval requests initiated by a user"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved user request list",
        content = @Content(schema = @Schema(implementation = OperationApproval.class))
    )
    @GetMapping("/users/{userId}/requests")
    public ResponseEntity<List<OperationApproval>> getUserRequests(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        return ResponseEntity.ok(operationApprovalService.findUserRequests(userId));
    }

    @Operation(
        summary = "Check Approval Requirement",
        description = "Check if an operation needs approval"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully checked approval requirement",
        content = @Content(schema = @Schema(implementation = Boolean.class))
    )
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkNeedsApproval(
            @Parameter(description = "Resource ID") @RequestParam Long resourceId,
            @Parameter(description = "Operation type (delete/publish)") @RequestParam String operationType,
            @Parameter(description = "User ID") @RequestParam Long userId) {
        return ResponseEntity.ok(
            operationApprovalService.needsApproval(resourceId, operationType, userId)
        );
    }
} 