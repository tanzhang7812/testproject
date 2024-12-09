package com.ssc.auth.entitlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ssc.auth.entitlement.entity.Resource;
import com.ssc.auth.entitlement.entity.enums.OwnerType;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByOwnerTypeAndOwnerId(OwnerType ownerType, Long ownerId);
    List<Resource> findByResourceTypeAndResourceId(String resourceType, Long resourceId);
} 