package com.ssc.auth.entitlement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "GEN_USERGROUP_ROLE")
@EqualsAndHashCode(callSuper = true)
public class UserGroupRole extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private UserGroup userGroup;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
} 