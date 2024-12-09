package com.ssc.auth.entitlement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssc.auth.entitlement.constant.OperationType;
import com.ssc.auth.entitlement.constant.RoleType;
import com.ssc.auth.entitlement.entity.*;
import com.ssc.auth.entitlement.entity.enums.OwnerType;
import com.ssc.auth.entitlement.entity.enums.ResourceType;
import com.ssc.auth.entitlement.exception.ResourceException;
import com.ssc.auth.entitlement.exception.UserException;
import com.ssc.auth.entitlement.repository.*;
import com.ssc.common.exception.ErrorCode;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;
    private final UserGroupRoleRepository userGroupRoleRepository;

    public Resource createResource(Resource resource, Long userId, Long groupId) {
        if (groupId != null) {
            UserGroupRole userGroupRole = userGroupRoleRepository.findByUserAndUserGroup(
                userRepository.getReferenceById(userId),
                userGroupRepository.getReferenceById(groupId)
            ).orElseThrow(() -> new UserException(
                ErrorCode.USER_NOT_IN_GROUP,
                userId
            ));

            if (!RoleType.OWNER.getValue().equals(userGroupRole.getRole().getRoleName())) {
                throw new ResourceException(
                    ErrorCode.RESOURCE_OWNER_ONLY,
                    "group resource"
                );
            }

            resource.setOwnerType(OwnerType.GROUP);
            resource.setOwnerId(groupId);
        } else {
            resource.setOwnerType(OwnerType.USER);
            resource.setOwnerId(userId);
        }

        return resourceRepository.save(resource);
    }

    public void deleteResource(Long resourceId, Long userId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                resourceId
            ));

        if (resource.getOwnerType() == OwnerType.USER) {
            if (!resource.getOwnerId().equals(userId)) {
                throw new ResourceException(
                    ErrorCode.RESOURCE_DELETE_DENIED,
                    resourceId
                );
            }
            resourceRepository.delete(resource);
        } else {
            UserGroupRole userGroupRole = userGroupRoleRepository.findByUserAndUserGroup(
                userRepository.getReferenceById(userId),
                userGroupRepository.getReferenceById(resource.getOwnerId())
            ).orElseThrow(() -> new UserException(
                ErrorCode.USER_NOT_IN_GROUP,
                userId
            ));

            if (!RoleType.OWNER.getValue().equals(userGroupRole.getRole().getRoleName())) {
                throw new ResourceException(
                    ErrorCode.RESOURCE_OWNER_ONLY,
                    "group resource"
                );
            }
            resourceRepository.delete(resource);
        }
    }

    public Resource updateResource(Resource resource, Long userId) {
        Resource existingResource = resourceRepository.findById(resource.getId())
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                resource.getId()
            ));

        if (!hasPermission(userId, resource.getId(), OperationType.UPDATE.getValue())) {
            throw new ResourceException(
                ErrorCode.RESOURCE_UPDATE_DENIED,
                resource.getId()
            );
        }

        existingResource.setResourceType(resource.getResourceType());
        existingResource.setResourceId(resource.getResourceId());
        
        return resourceRepository.save(existingResource);
    }

    public void publishResource(Long resourceId, Long userId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                resourceId
            ));

        if (!hasPermission(userId, resourceId, OperationType.PUBLISH.getValue())) {
            throw new ResourceException(
                ErrorCode.RESOURCE_PUBLISH_DENIED,
                resourceId
            );
        }
    }

    @Transactional(readOnly = true)
    public Optional<Resource> findById(Long resourceId) {
        return resourceRepository.findById(resourceId);
    }

    @Transactional(readOnly = true)
    public List<Resource> findByOwner(OwnerType ownerType, Long ownerId) {
        return resourceRepository.findByOwnerTypeAndOwnerId(ownerType, ownerId);
    }

    @Transactional(readOnly = true)
    public List<Resource> findByType(ResourceType resourceType) {
        return resourceRepository.findByResourceTypeAndResourceId(resourceType.name(), null);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, Long resourceId, String operation) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                resourceId
            ));

        if (resource.getOwnerType() == OwnerType.USER) {
            if (!resource.getOwnerId().equals(userId)) {
                throw new ResourceException(
                    ErrorCode.RESOURCE_NO_PERMISSION,
                    "No permission for this operation, resource belongs to another user"
                );
            }
            return true;
        }

        Optional<UserGroupRole> userGroupRole = userGroupRoleRepository.findByUserAndUserGroup(
            userRepository.getReferenceById(userId),
            userGroupRepository.getReferenceById(resource.getOwnerId())
        );

        if (userGroupRole.isEmpty()) {
            throw new UserException(
                ErrorCode.USER_NOT_IN_GROUP,
                userId
            );
        }

        String roleName = userGroupRole.get().getRole().getRoleName();
        
        if (RoleType.OWNER.getValue().equals(roleName)) {
            return true;
        }

        boolean isDeveloper = RoleType.DEVELOPER.getValue().equals(roleName);
        boolean isAllowedOperation = OperationType.UPDATE.getValue().equals(operation) ||
                                   OperationType.DELETE.getValue().equals(operation) ||
                                   OperationType.PUBLISH.getValue().equals(operation);

        if (!isDeveloper || !isAllowedOperation) {
            throw new ResourceException(
                ErrorCode.RESOURCE_NO_PERMISSION,
                String.format("Operation %s not allowed for role %s", operation, roleName)
            );
        }

        return true;
    }
} 