package com.ssc.auth.entitlement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssc.auth.entitlement.constant.ApprovalStatus;
import com.ssc.auth.entitlement.constant.OperationType;
import com.ssc.auth.entitlement.constant.RoleType;
import com.ssc.auth.entitlement.entity.*;
import com.ssc.auth.entitlement.entity.enums.OwnerType;
import com.ssc.auth.entitlement.exception.ApprovalException;
import com.ssc.auth.entitlement.exception.ResourceException;
import com.ssc.auth.entitlement.exception.UserException;
import com.ssc.auth.entitlement.repository.*;
import com.ssc.common.exception.ErrorCode;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OperationApprovalService {
    private final OperationApprovalRepository operationApprovalRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserGroupRoleRepository userGroupRoleRepository;

    public OperationApproval createApproval(Long resourceId, String operationType, Long requestUserId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                resourceId
            ));
        
        User requestUser = userRepository.findById(requestUserId)
            .orElseThrow(() -> new UserException(
                ErrorCode.USER_NOT_FOUND,
                requestUserId
            ));

        if (!needsApproval(resourceId, operationType, requestUserId)) {
            throw new ApprovalException(
                ErrorCode.APPROVAL_NOT_NEEDED,
                operationType
            );
        }

        OperationApproval approval = new OperationApproval();
        approval.setResource(resource);
        approval.setOperationType(operationType);
        approval.setRequestedBy(requestUser);
        approval.setStatus(ApprovalStatus.PENDING.getValue());
        approval.setRequestTime(LocalDateTime.now());

        return operationApprovalRepository.save(approval);
    }

    public void approveOperation(Long approvalId, Long approverUserId) {
        OperationApproval approval = operationApprovalRepository.findById(approvalId)
            .orElseThrow(() -> new ApprovalException(
                ErrorCode.APPROVAL_NOT_FOUND,
                approvalId
            ));
        
        if (!ApprovalStatus.PENDING.getValue().equals(approval.getStatus())) {
            throw new ApprovalException(
                ErrorCode.APPROVAL_ALREADY_PROCESSED,
                approvalId
            );
        }

        User approver = userRepository.findById(approverUserId)
            .orElseThrow(() -> new UserException(
                ErrorCode.USER_NOT_FOUND,
                approverUserId
            ));

        if (approval.getResource().getOwnerType() == OwnerType.GROUP) {
            UserGroupRole approverRole = userGroupRoleRepository.findByUserAndUserGroup(
                approver,
                userGroupRepository.getReferenceById(approval.getResource().getOwnerId())
            ).orElseThrow(() -> new ApprovalException(
                ErrorCode.APPROVER_NOT_FOUND,
                approverUserId
            ));

            if (!RoleType.OWNER.getValue().equals(approverRole.getRole().getRoleName())) {
                throw new ApprovalException(
                    ErrorCode.APPROVAL_NO_PERMISSION,
                    approverUserId
                );
            }
        } else {
            throw new ApprovalException(
                ErrorCode.APPROVAL_NOT_NEEDED,
                "Only group resources need approval"
            );
        }

        approval.setApprovedBy(approver);
        approval.setStatus(ApprovalStatus.APPROVED.getValue());
        approval.setApproveTime(LocalDateTime.now());
        operationApprovalRepository.save(approval);
    }

    public void rejectOperation(Long approvalId, Long approverUserId) {
        OperationApproval approval = operationApprovalRepository.findById(approvalId)
            .orElseThrow(() -> new ApprovalException(
                ErrorCode.APPROVAL_NOT_FOUND,
                approvalId
            ));
        
        if (!ApprovalStatus.PENDING.getValue().equals(approval.getStatus())) {
            throw new ApprovalException(
                ErrorCode.APPROVAL_ALREADY_PROCESSED,
                approvalId
            );
        }

        User approver = userRepository.findById(approverUserId)
            .orElseThrow(() -> new UserException(
                ErrorCode.USER_NOT_FOUND,
                approverUserId
            ));

        if (approval.getResource().getOwnerType() == OwnerType.GROUP) {
            UserGroupRole approverRole = userGroupRoleRepository.findByUserAndUserGroup(
                approver,
                userGroupRepository.getReferenceById(approval.getResource().getOwnerId())
            ).orElseThrow(() -> new ApprovalException(
                ErrorCode.APPROVER_NOT_FOUND,
                approverUserId
            ));

            if (!RoleType.OWNER.getValue().equals(approverRole.getRole().getRoleName())) {
                throw new ApprovalException(
                    ErrorCode.APPROVAL_NO_PERMISSION,
                    approverUserId
                );
            }
        } else {
            throw new ApprovalException(
                ErrorCode.APPROVAL_NOT_NEEDED,
                "Only group resources need approval"
            );
        }

        approval.setApprovedBy(approver);
        approval.setStatus(ApprovalStatus.REJECTED.getValue());
        approval.setApproveTime(LocalDateTime.now());
        operationApprovalRepository.save(approval);
    }

    @Transactional(readOnly = true)
    public List<OperationApproval> findPendingApprovals(Long resourceId) {
        Resource resource = resourceRepository.getReferenceById(resourceId);
        return operationApprovalRepository.findByResource(resource)
            .stream()
            .filter(approval -> ApprovalStatus.PENDING.getValue().equals(approval.getStatus()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<OperationApproval> findUserRequests(Long userId) {
        User user = userRepository.getReferenceById(userId);
        return operationApprovalRepository.findByRequestedBy(user);
    }

    @Transactional(readOnly = true)
    public boolean needsApproval(Long resourceId, String operationType, Long userId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                resourceId
            ));

        if (resource.getOwnerType() == OwnerType.USER) {
            return false;
        }

        UserGroupRole userRole = userGroupRoleRepository.findByUserAndUserGroup(
            userRepository.getReferenceById(userId),
            userGroupRepository.getReferenceById(resource.getOwnerId())
        ).orElseThrow(() -> new UserException(
            ErrorCode.USER_NOT_IN_GROUP,
            userId
        ));

        String roleName = userRole.getRole().getRoleName();
        
        if (RoleType.OWNER.getValue().equals(roleName)) {
            return false;
        }

        return RoleType.DEVELOPER.getValue().equals(roleName) && 
               (OperationType.DELETE.getValue().equals(operationType) || 
                OperationType.PUBLISH.getValue().equals(operationType));
    }
} 