# DRM_CORE_AUDIT.md

# Phase 1D.8A — DRM Core Audit

Based on actual source review of the current Canidae Lineages codebase.

## Summary

Current finding:

```txt
DRM Core ............. ~80%
Canidae-Specific ..... ~15%
UI/Application ....... ~5%
```

The project is already much closer to a reusable DRM engine than expected.

---

## DRM CORE FILES

### Types

```txt
src/types/animal.ts
src/types/genetics.ts
```

Classification: DRM Core

Reason:
Defines the fundamental biological data model used throughout the simulator.

---

### Genetics

```txt
src/genetics/calculateInbreeding.ts
```

Classification: DRM Core

Reason:
Pedigree mathematics is species agnostic.

---

```txt
src/genetics/genotypeEngine.ts
```

Classification: DRM Core

Reason:
Inheritance engine.

---

```txt
src/genetics/resolveTraits.ts
```

Classification: DRM Core

Reason:
Trait inheritance framework.

---

```txt
src/genetics/resolveMutation.ts
```

Classification: DRM Core

Reason:
Mutation generation and inheritance.

---

```txt
src/genetics/healthEngine.ts
```

Classification: DRM Core

Reason:
Health evaluation framework.

---

```txt
src/genetics/developmentalAnomalyEngine.ts
```

Classification: DRM Core

Reason:
Developmental risk, anomaly generation, audit logic.

---

```txt
src/genetics/phenotypeEngine.ts
```

Classification: Shared / Needs Adapter Separation

Reason:
Phenotype resolution is DRM.
Many phenotype definitions are likely canid-oriented.

Future:
Move species-specific phenotype rules into species adapters.

---

```txt
src/genetics/normalizeCarriers.ts
```

Classification: DRM Core

Reason:
Generic carrier normalization.

---

### Reproduction

```txt
src/reproduction/reproductionEngine.ts
```

Classification: DRM Core

Reason:
Pregnancy, fertility, gestation framework.

---

### Breeding

```txt
src/breeding/createLitter.ts
```

Classification: DRM Core

Reason:
Litter generation process.

---

```txt
src/breeding/createOffspring.ts
```

Classification: DRM Core

Reason:
Primary offspring generation pipeline.

---

```txt
src/breeding/createHybridName.ts
```

Classification: Shared / Needs Adapter Separation

Reason:
Hybrid naming is portable in concept but current naming rules are canid-oriented.

---

```txt
src/breeding/resolveCompatibility.ts
```

Classification: Shared / Needs Adapter Separation

Reason:
Compatibility engine is DRM.
Compatibility values are species data.

Future:
Move compatibility tables into species adapters.

---

### Lineage

```txt
src/lineage/resolvelineage.ts
```

Classification: DRM Core

Reason:
Lineage composition tracking is universally useful.

---

### Statistics

```txt
src/stats/calculatePopulationStats.ts
```

Classification: DRM Core

Reason:
Population analytics are species agnostic.

---

## CANIDAE-SPECIFIC FILES

### Data Layer

```txt
src/data/breeding_rules_starter.json
```

Classification: Canidae Adapter

Reason:
Contains current species assumptions and breeding values.

Future:
Replace with species-pack configuration.

---

## APPLICATION LAYER

```txt
src/main.ts
```

Classification: Project Layer

Reason:
UI, rendering, interaction, presentation.

Not DRM.

---

```txt
src/style.css
src/assets/*
```

Classification: Project Layer

Not DRM.

---

## EXTRACTION TARGET

Future DRM package:

```txt
drm/
├── types/
├── genetics/
├── reproduction/
├── breeding/
├── lineage/
├── population/
└── compatibility/
```

Canidae becomes:

```txt
species/canidae/
├── traits/
├── mutations/
├── compatibility/
├── phenotype-rules/
└── reconstruction/
```

---

## Result

Conclusion:

DRM is already largely species-agnostic.

Project Genesis does NOT require a new genetics engine.

Project Genesis requires:
1. Extraction of DRM Core.
2. Creation of Species Adapters.
3. Migration of canid-specific data out of the core.
