package com.ssc.auth.entitlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ssc.auth.entitlement.entity.User;
import com.ssc.auth.entitlement.entity.UserGroup;
import com.ssc.auth.entitlement.entity.UserGroupRole;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGroupRoleRepository extends JpaRepository<UserGroupRole, Long> {
    List<UserGroupRole> findByUser(User user);
    List<UserGroupRole> findByUserGroup(UserGroup userGroup);
    Optional<UserGroupRole> findByUserAndUserGroup(User user, UserGroup userGroup);
} 