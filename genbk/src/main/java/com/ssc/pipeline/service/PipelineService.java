package com.ssc.pipeline.service;

import com.ssc.auth.entitlement.entity.Resource;
import com.ssc.auth.entitlement.entity.enums.OwnerType;
import com.ssc.auth.entitlement.entity.enums.ResourceType;
import com.ssc.auth.entitlement.service.ResourceService;
import com.ssc.pipeline.entity.Pipeline;
import com.ssc.pipeline.entity.enums.PipelineStatus;
import com.ssc.pipeline.exception.PipelineException;
import com.ssc.pipeline.repository.PipelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PipelineService {
    private final PipelineRepository pipelineRepository;
    private final ResourceService resourceService;

    public Pipeline createPipeline(Pipeline pipeline, Long userId, Long groupId) {
        if (pipelineRepository.existsByNameAndOwnerId(pipeline.getName(), userId)) {
            throw new PipelineException("Pipeline name already exists");
        }
        pipeline.setOwnerId(userId);
        pipeline.setStatus(PipelineStatus.DRAFT);
        Pipeline savedPipeline = pipelineRepository.save(pipeline);

        Resource resource = new Resource();
        resource.setResourceType(ResourceType.PIPELINE);
        resource.setResourceId(savedPipeline.getId());
        resourceService.createResource(resource, userId, groupId);

        return savedPipeline;
    }

    public Pipeline updatePipeline(Pipeline pipeline, Long userId) {
        Pipeline existingPipeline = pipelineRepository.findById(pipeline.getId())
            .orElseThrow(() -> new PipelineException("Pipeline not found"));

        resourceService.hasPermission(userId, existingPipeline.getId(), "update");

        existingPipeline.setName(pipeline.getName());
        existingPipeline.setDescription(pipeline.getDescription());
        existingPipeline.setConfiguration(pipeline.getConfiguration());

        return pipelineRepository.save(existingPipeline);
    }

    public void deletePipeline(Long pipelineId, Long userId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineException("Pipeline not found"));

        resourceService.hasPermission(userId, pipelineId, "delete");

        pipelineRepository.delete(pipeline);
    }

    public Pipeline publishPipeline(Long pipelineId, Long userId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineException("Pipeline not found"));

        resourceService.hasPermission(userId, pipelineId, "publish");

        pipeline.setStatus(PipelineStatus.PUBLISHED);
        return pipelineRepository.save(pipeline);
    }

    @Transactional(readOnly = true)
    public Pipeline getPipeline(Long pipelineId, Long userId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineException("Pipeline not found"));

        resourceService.hasPermission(userId, pipelineId, "view");

        return pipeline;
    }

    @Transactional(readOnly = true)
    public List<Pipeline> getUserPipelines(Long userId) {
        List<Resource> resources = resourceService.findByType(ResourceType.PIPELINE);
        return resources.stream()
            .map(resource -> pipelineRepository.findById(resource.getResourceId())
                .orElseThrow(() -> new PipelineException("Pipeline not found")))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Pipeline> getGroupPipelines(Long groupId) {
        List<Resource> resources = resourceService.findByOwner(OwnerType.GROUP, groupId);
        return resources.stream()
            .filter(resource -> resource.getResourceType() == ResourceType.PIPELINE)
            .map(resource -> pipelineRepository.findById(resource.getResourceId())
                .orElseThrow(() -> new PipelineException("Pipeline not found")))
            .toList();
    }
} 