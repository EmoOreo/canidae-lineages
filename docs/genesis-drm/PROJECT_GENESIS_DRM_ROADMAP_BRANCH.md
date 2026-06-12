# PROJECT GENESIS DRM ROADMAP BRANCH

## Status
Active planning branch.

## Purpose
This roadmap branch defines how the frozen DRM v0.2 genetics foundation from Canidae Lineages becomes a reusable genetics backbone for Project Genesis.

## Core Principle

Canidae Lineages is the reference implementation.

Project Genesis is the larger consumer.

DRM v0.2 is not considered genetically complete forever. It is considered stable enough to serve as the first reusable genetics kernel.

## Roadmap Branch

```txt
Project Genesis
├── Canon
├── Archive
├── DRM Genetics
│   ├── DRM v0.2 Foundation Freeze
│   ├── Genesis Integration Spec
│   ├── DRM Core Extraction
│   ├── Canid-Specific Separation
│   ├── Species Portability Testing
│   └── Future DRM v1.0 Genetics
└── Species Expansion
```

## Phase 1D.8 — Genesis DRM Extraction

### 1D.8A — DRM Core Audit
Identify which systems are truly reusable across all animal groups.

Examples:
- inheritance
- genotype/phenotype resolution
- pedigree tracking
- mutation handling
- health profiles
- developmental anomaly profiles
- population testing
- risk auditing

### 1D.8B — Canid-Specific Audit
Identify which systems belong only to Canidae Lineages.

Examples:
- canid coat colors
- tail carriage
- ear carriage
- dire wolf reconstruction assumptions
- Caninae compatibility tiers
- canid-specific anomaly weighting

### 1D.8C — Genesis Integration Spec
Define exactly how Project Genesis consumes DRM.

Deliverable:
- PROJECT_GENESIS_DRM_INTEGRATION_SPEC.md

### 1D.8D — Species Portability Plan
Define how DRM supports non-canid species.

Initial targets:
- Felidae Lineages
- Equidae Lineages
- Avian Lineages
- Proboscidean Lineages

### 1D.8E — DRM Package Architecture
Plan a future reusable DRM package.

Potential structure:

```txt
src/drm/
├── core/
├── inheritance/
├── mutation/
├── health/
├── development/
├── population/
└── species-adapters/
```

## Freeze Rules

During this roadmap branch:

- Do not add new DRM biology features.
- Do not rebalance the current Canidae genetics core unless a bug is discovered.
- Focus on documentation, separation, portability, and integration.
- Genetics v1.0 features remain parked in GENETICS_FUTURE_FEATURES.md.

## Completion Criteria

This branch is complete when:

- DRM core responsibilities are documented.
- Canid-specific responsibilities are documented.
- Project Genesis has a formal DRM integration spec.
- The first portability plan exists.
- Future extraction into a reusable DRM package is clearly defined.
