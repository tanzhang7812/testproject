package com.ssc.pipeline.controller;

import com.ssc.pipeline.entity.Pipeline;
import com.ssc.pipeline.service.PipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Pipeline Management", description = "APIs for pipeline management")
@RestController
@RequestMapping("/api/pipelines")
@RequiredArgsConstructor
public class PipelineController {
    private final PipelineService pipelineService;

    @Operation(summary = "Create Pipeline")
    @PostMapping
    public ResponseEntity<Pipeline> createPipeline(
            @RequestBody Pipeline pipeline,
            @RequestParam Long userId,
            @RequestParam(required = false) Long groupId) {
        return ResponseEntity.ok(pipelineService.createPipeline(pipeline, userId, groupId));
    }

    @Operation(summary = "Update Pipeline")
    @PutMapping("/{id}")
    public ResponseEntity<Pipeline> updatePipeline(
            @PathVariable Long id,
            @RequestBody Pipeline pipeline,
            @RequestParam Long userId) {
        pipeline.setId(id);
        return ResponseEntity.ok(pipelineService.updatePipeline(pipeline, userId));
    }

    @Operation(summary = "Delete Pipeline")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePipeline(
            @PathVariable Long id,
            @RequestParam Long userId) {
        pipelineService.deletePipeline(id, userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Publish Pipeline")
    @PostMapping("/{id}/publish")
    public ResponseEntity<Pipeline> publishPipeline(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(pipelineService.publishPipeline(id, userId));
    }

    @Operation(summary = "Get Pipeline")
    @GetMapping("/{id}")
    public ResponseEntity<Pipeline> getPipeline(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(pipelineService.getPipeline(id, userId));
    }

    @Operation(summary = "Get User's Pipelines")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Pipeline>> getUserPipelines(@PathVariable Long userId) {
        return ResponseEntity.ok(pipelineService.getUserPipelines(userId));
    }

    @Operation(summary = "Get Group's Pipelines")
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Pipeline>> getGroupPipelines(@PathVariable Long groupId) {
        return ResponseEntity.ok(pipelineService.getGroupPipelines(groupId));
    }
} 