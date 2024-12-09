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

import com.ssc.auth.entitlement.entity.Role;
import com.ssc.auth.entitlement.entity.User;
import com.ssc.auth.entitlement.entity.UserGroup;
import com.ssc.auth.entitlement.service.UserGroupService;

import java.util.List;

@Tag(name = "User Group Management", description = "APIs for user group management")
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class UserGroupController {
    private final UserGroupService userGroupService;

    @Operation(summary = "Create Group", description = "Create a new user group")
    @ApiResponse(
        responseCode = "200",
        description = "Group created successfully",
        content = @Content(schema = @Schema(implementation = UserGroup.class))
    )
    @PostMapping
    public ResponseEntity<UserGroup> createGroup(
            @Parameter(description = "Group information") @RequestBody UserGroup group) {
        return ResponseEntity.ok(userGroupService.createGroup(group));
    }

    @Operation(summary = "Add User to Group", description = "Add user to specified group with role")
    @ApiResponse(responseCode = "200", description = "User added to group successfully")
    @PostMapping("/{groupId}/users/{userId}/roles/{roleId}")
    public ResponseEntity<Void> addUserToGroup(
            @Parameter(description = "Group ID") @PathVariable Long groupId,
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Role ID") @PathVariable Long roleId) {
        userGroupService.addUserToGroup(userId, groupId, roleId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove User from Group", description = "Remove user from specified group")
    @ApiResponse(responseCode = "200", description = "User removed from group successfully")
    @DeleteMapping("/{groupId}/users/{userId}")
    public ResponseEntity<Void> removeUserFromGroup(
            @Parameter(description = "Group ID") @PathVariable Long groupId,
            @Parameter(description = "User ID") @PathVariable Long userId) {
        userGroupService.removeUserFromGroup(userId, groupId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update User Role", description = "Update user's role in group")
    @ApiResponse(responseCode = "200", description = "User role updated successfully")
    @PutMapping("/{groupId}/users/{userId}/roles/{roleId}")
    public ResponseEntity<Void> updateUserRole(
            @Parameter(description = "Group ID") @PathVariable Long groupId,
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "New role ID") @PathVariable Long roleId) {
        userGroupService.updateUserRole(userId, groupId, roleId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get User's Groups", description = "Get all groups that user belongs to")
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved group list",
        content = @Content(schema = @Schema(implementation = UserGroup.class))
    )
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserGroup>> getGroupsByUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        return ResponseEntity.ok(userGroupService.findGroupsByUser(userId));
    }

    @Operation(summary = "Get Group Users", description = "Get all users in specified group")
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved user list",
        content = @Content(schema = @Schema(implementation = User.class))
    )
    @GetMapping("/{groupId}/users")
    public ResponseEntity<List<User>> getUsersByGroup(
            @Parameter(description = "Group ID") @PathVariable Long groupId) {
        return ResponseEntity.ok(userGroupService.findUsersByGroup(groupId));
    }

    @Operation(summary = "Get User Role in Group", description = "Get user's role in specified group")
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved user role",
        content = @Content(schema = @Schema(implementation = Role.class))
    )
    @GetMapping("/{groupId}/users/{userId}/role")
    public ResponseEntity<Role> getUserRoleInGroup(
            @Parameter(description = "Group ID") @PathVariable Long groupId,
            @Parameter(description = "User ID") @PathVariable Long userId) {
        return userGroupService.getUserRoleInGroup(userId, groupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 