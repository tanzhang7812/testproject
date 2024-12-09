package com.ssc.auth.entitlement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ssc.auth.entitlement.entity.OperationApproval;
import com.ssc.auth.entitlement.entity.Resource;
import com.ssc.auth.entitlement.entity.User;

import java.util.List;

@Repository
public interface OperationApprovalRepository extends JpaRepository<OperationApproval, Long> {
    List<OperationApproval> findByResource(Resource resource);
    List<OperationApproval> findByRequestedBy(User requestedBy);
    List<OperationApproval> findByApprovedBy(User approvedBy);
    List<OperationApproval> findByStatus(String status);
} 