package com.ssc.auth.entitlement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssc.auth.entitlement.entity.*;
import com.ssc.auth.entitlement.exception.GroupException;
import com.ssc.auth.entitlement.exception.ResourceException;
import com.ssc.auth.entitlement.exception.UserException;
import com.ssc.auth.entitlement.repository.*;
import com.ssc.common.exception.ErrorCode;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserGroupService {
    private final UserGroupRepository userGroupRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserGroupRoleRepository userGroupRoleRepository;

    public UserGroup createGroup(UserGroup userGroup) {
        if (userGroupRepository.existsByGroupName(userGroup.getGroupName())) {
            throw new GroupException(
                ErrorCode.GROUP_NAME_EXISTS,
                userGroup.getGroupName()
            );
        }
        return userGroupRepository.save(userGroup);
    }

    public void addUserToGroup(Long userId, Long groupId, Long roleId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserException(
                ErrorCode.USER_NOT_FOUND,
                userId
            ));

        UserGroup group = userGroupRepository.findById(groupId)
            .orElseThrow(() -> new GroupException(
                ErrorCode.GROUP_NOT_FOUND,
                groupId
            ));

        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                roleId
            ));

        if (userGroupRoleRepository.findByUserAndUserGroup(user, group).isPresent()) {
            throw new GroupException(
                ErrorCode.USER_ALREADY_IN_GROUP,
                userId
            );
        }

        UserGroupRole userGroupRole = new UserGroupRole();
        userGroupRole.setUser(user);
        userGroupRole.setUserGroup(group);
        userGroupRole.setRole(role);
        userGroupRoleRepository.save(userGroupRole);
    }

    public void removeUserFromGroup(Long userId, Long groupId) {
        userGroupRoleRepository.findByUserAndUserGroup(
            userRepository.getReferenceById(userId),
            userGroupRepository.getReferenceById(groupId)
        ).ifPresent(userGroupRoleRepository::delete);
    }

    public void updateUserRole(Long userId, Long groupId, Long newRoleId) {
        UserGroupRole userGroupRole = userGroupRoleRepository.findByUserAndUserGroup(
            userRepository.getReferenceById(userId),
            userGroupRepository.getReferenceById(groupId)
        ).orElseThrow(() -> new UserException(
            ErrorCode.USER_NOT_IN_GROUP,
            userId
        ));

        Role newRole = roleRepository.findById(newRoleId)
            .orElseThrow(() -> new ResourceException(
                ErrorCode.RESOURCE_NOT_FOUND,
                newRoleId
            ));
        
        userGroupRole.setRole(newRole);
        userGroupRoleRepository.save(userGroupRole);
    }

    @Transactional(readOnly = true)
    public List<UserGroup> findGroupsByUser(Long userId) {
        return userGroupRoleRepository.findByUser(userRepository.getReferenceById(userId))
            .stream()
            .map(UserGroupRole::getUserGroup)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<User> findUsersByGroup(Long groupId) {
        return userGroupRoleRepository.findByUserGroup(userGroupRepository.getReferenceById(groupId))
            .stream()
            .map(UserGroupRole::getUser)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Role> getUserRoleInGroup(Long userId, Long groupId) {
        return userGroupRoleRepository.findByUserAndUserGroup(
            userRepository.getReferenceById(userId),
            userGroupRepository.getReferenceById(groupId)
        ).map(UserGroupRole::getRole);
    }
} 