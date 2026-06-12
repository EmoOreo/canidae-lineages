# DRM_PACKAGE_ARCHITECTURE.md

# Phase 1D.8E — DRM Package Architecture

## Status
Planning Document

## Purpose

Define the future extraction structure for DRM.

Current state:

Canidae Lineages contains both:

- reusable genetics systems
- canid-specific implementation data

This document defines how those responsibilities separate in the future.

---

# Architecture Overview

```txt
Project Genesis
    ↓
Species Adapter
    ↓
DRM Core
```

Project Genesis consumes species adapters.

Species adapters consume DRM.

DRM remains species-agnostic.

---

# Layer 1 — DRM Core

Purpose:

Reusable biological simulation engine.

No species-specific assumptions.

```txt
drm/
├── core/
├── types/
├── genetics/
├── health/
├── development/
├── reproduction/
├── population/
├── compatibility/
└── reporting/
```

---

## core/

General-purpose systems.

```txt
drm/core/
├── random.ts
├── validation.ts
├── audit.ts
└── constants.ts
```

Responsibilities:

- validation
- randomness
- auditing
- shared utilities

---

## types/

Universal biological models.

```txt
drm/types/
├── Animal.ts
├── Genome.ts
├── Mutation.ts
├── Health.ts
├── Pedigree.ts
└── PopulationReport.ts
```

Responsibilities:

- data contracts
- shared interfaces
- serialization structures

---

## genetics/

Inheritance systems.

```txt
drm/genetics/
├── genotypeEngine.ts
├── resolveTraits.ts
├── resolveMutation.ts
├── calculateInbreeding.ts
└── lineageEngine.ts
```

Responsibilities:

- inheritance
- carrier tracking
- mutation inheritance
- lineage calculations

---

## health/

Health evaluation systems.

```txt
drm/health/
├── healthEngine.ts
├── diseaseEngine.ts
└── robustnessEngine.ts
```

Responsibilities:

- health scoring
- disease liability
- longevity calculations

---

## development/

Developmental biology systems.

```txt
drm/development/
├── developmentalAnomalyEngine.ts
├── developmentalRisk.ts
└── developmentalAudit.ts
```

Responsibilities:

- developmental stability
- developmental risk
- anomaly generation
- audit breakdown

---

## reproduction/

Reproductive systems.

```txt
drm/reproduction/
├── reproductionEngine.ts
├── gestationEngine.ts
├── fertilityEngine.ts
└── offspringEngine.ts
```

Responsibilities:

- pregnancy
- fertility
- gestation
- offspring creation

---

## population/

Population simulation systems.

```txt
drm/population/
├── populationTestRunner.ts
├── founderSuite.ts
├── batchSimulation.ts
└── statistics.ts
```

Responsibilities:

- batch testing
- founder validation
- population analytics
- benchmark generation

---

## compatibility/

Compatibility framework.

```txt
drm/compatibility/
├── compatibilityEngine.ts
└── compatibilityTypes.ts
```

Responsibilities:

- compatibility calculations
- compatibility interfaces

Important:

Compatibility values do NOT live here.

Only the engine.

---

## reporting/

Report generation.

```txt
drm/reporting/
├── markdownReport.ts
├── jsonReport.ts
└── auditReport.ts
```

Responsibilities:

- report exports
- audit exports
- benchmark exports

---

# Layer 2 — Species Adapters

Purpose:

Provide species-specific biological content.

```txt
species/
├── canidae/
├── felidae/
├── avian/
├── proboscidea/
└── reptilia/
```

---

## Example

```txt
species/canidae/
├── species.json
├── loci.json
├── traits.json
├── mutations.json
├── health.json
├── anomalies.json
├── compatibility.json
├── phenotype-rules.json
└── reconstruction.json
```

Responsibilities:

- trait definitions
- phenotype rules
- mutation catalogs
- anomaly catalogs
- compatibility values
- reconstruction assumptions

---

# Layer 3 — Project Genesis

Purpose:

Consume DRM and species adapters.

```txt
project-genesis/
├── archive/
├── breeding/
├── simulation/
├── research/
├── ui/
└── progression/
```

Responsibilities:

- player interaction
- progression systems
- archive systems
- breeding systems
- research systems

---

# Extraction Rules

## DRM Must Never Contain

- dog-specific traits
- cat-specific traits
- bird-specific traits
- species compatibility tables
- species reconstruction assumptions

---

## Species Adapters Must Never Contain

- inheritance engines
- mutation engines
- audit engines
- pedigree engines
- population simulation engines

---

# Future Extraction Sequence

## Step 1

Freeze DRM v0.2

Status: Complete

---

## Step 2

Document DRM

Status: Complete

---

## Step 3

Separate species data

Status: Future

---

## Step 4

Extract DRM package

Status: Future

---

## Step 5

Build Felidae adapter

Status: Future

---

## Step 6

Integrate into Project Genesis

Status: Future

---

# Architecture Decision

Current recommendation:

Do NOT begin extraction immediately.

The genetics foundation is stable but the simulator still benefits more from:

- breeding presentation
- population management
- usability improvements

before undertaking major code reorganization.

---

# Completion Criteria

1D.8E is complete when:

- DRM Core structure is defined
- Species Adapter structure is defined
- Project Genesis integration layer is defined
- Extraction sequence is documented

Result:

DRM v0.2 now has a complete extraction architecture.
