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

import com.ssc.auth.entitlement.entity.Resource;
import com.ssc.auth.entitlement.entity.enums.OwnerType;
import com.ssc.auth.entitlement.entity.enums.ResourceType;
import com.ssc.auth.entitlement.service.ResourceService;

import java.util.List;

@Tag(name = "Resource Management", description = "APIs for resource management")
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {
    private final ResourceService resourceService;

    @Operation(
        summary = "Create Resource",
        description = "Create a new resource, can be owned by user or group"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Resource created successfully",
        content = @Content(schema = @Schema(implementation = Resource.class))
    )
    @PostMapping
    public ResponseEntity<Resource> createResource(
            @Parameter(description = "Resource information") @RequestBody Resource resource,
            @Parameter(description = "Creator user ID") @RequestParam Long userId,
            @Parameter(description = "Owner group ID (optional)") @RequestParam(required = false) Long groupId) {
        return ResponseEntity.ok(resourceService.createResource(resource, userId, groupId));
    }

    @Operation(
        summary = "Delete Resource",
        description = "Delete specified resource, requires proper permissions"
    )
    @ApiResponse(responseCode = "200", description = "Resource deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @Parameter(description = "Resource ID") @PathVariable Long id,
            @Parameter(description = "Operator user ID") @RequestParam Long userId) {
        resourceService.deleteResource(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Update Resource",
        description = "Update resource information, requires proper permissions"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Resource updated successfully",
        content = @Content(schema = @Schema(implementation = Resource.class))
    )
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @Parameter(description = "Resource ID") @PathVariable Long id,
            @Parameter(description = "Resource information") @RequestBody Resource resource,
            @Parameter(description = "Operator user ID") @RequestParam Long userId) {
        resource.setId(id);
        return ResponseEntity.ok(resourceService.updateResource(resource, userId));
    }

    @Operation(
        summary = "Publish Resource",
        description = "Publish specified resource, requires proper permissions"
    )
    @ApiResponse(responseCode = "200", description = "Resource published successfully")
    @PostMapping("/{id}/publish")
    public ResponseEntity<Void> publishResource(
            @Parameter(description = "Resource ID") @PathVariable Long id,
            @Parameter(description = "Operator user ID") @RequestParam Long userId) {
        resourceService.publishResource(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Get Resource",
        description = "Get detailed information of specified resource"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved resource information",
        content = @Content(schema = @Schema(implementation = Resource.class))
    )
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResource(
            @Parameter(description = "Resource ID") @PathVariable Long id) {
        return resourceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Get Resources by Owner",
        description = "Get all resources owned by specified user or group"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved resource list",
        content = @Content(schema = @Schema(implementation = Resource.class))
    )
    @GetMapping("/owner")
    public ResponseEntity<List<Resource>> getResourcesByOwner(
            @Parameter(description = "Owner type (USER/GROUP)") @RequestParam OwnerType ownerType,
            @Parameter(description = "Owner ID") @RequestParam Long ownerId) {
        return ResponseEntity.ok(resourceService.findByOwner(ownerType, ownerId));
    }

    @Operation(
        summary = "Get Resources by Type",
        description = "Get all resources of specified type"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved resource list",
        content = @Content(schema = @Schema(implementation = Resource.class))
    )
    @GetMapping("/type/{resourceType}")
    public ResponseEntity<List<Resource>> getResourcesByType(
            @Parameter(description = "Resource type (JOB/PIPELINE)") @PathVariable ResourceType resourceType) {
        return ResponseEntity.ok(resourceService.findByType(resourceType));
    }
} 