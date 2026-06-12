# SPECIES PORTABILITY PLAN

## Phase
1D.8D — Species Portability Plan

## Status
Planning document. No non-canid implementation tests have been run yet.

## Purpose
This document defines how DRM v0.2 can be evaluated for use beyond Canidae Lineages and eventually become the genetics foundation for Project Genesis.

The goal is not to immediately implement lions, birds, elephants, or reptiles. The goal is to define what would need to be true for DRM to support them without rewriting the engine.

---

## Core Question

Can DRM v0.2 support additional animal groups by changing species adapters rather than rewriting the genetics engine?

---

## Current Reference Implementation

### Canidae Lineages

Current tested group:

- Domestic Dog
- Gray Wolf
- Dire Wolf
- Coyote
- Red Fox
- Fennec Fox

Current systems validated:

- inheritance
- mutation generation
- health profiles
- developmental anomalies
- inbreeding
- hybrid compatibility
- population testing
- developmental risk audit

Canidae Lineages is the reference implementation for DRM v0.2.

---

## Portability Targets

These are not immediate implementation tasks. They are future stress tests.

### 1. Felidae

Possible species:

- Lion
- Tiger
- Leopard
- Smilodon

Why this is the first recommended test:

- mammalian
- live birth
- predator ecology
- pedigree-compatible
- different morphology from canids

Systems stressed:

- coat patterns
- mane traits
- body size
- skull proportions
- predator behavior
- extinct reconstruction via Smilodon

Expected difficulty:

Medium-low.

Felidae is the best first non-canid test.

---

### 2. Avian

Possible species:

- Chicken
- Raven
- Eagle
- Dodo

Systems stressed:

- egg laying
- clutch size
- incubation
- feathers
- beak morphology
- flight traits

Expected difficulty:

High.

Avian support will expose mammal-specific assumptions in reproduction and phenotype systems.

---

### 3. Proboscidea

Possible species:

- African Elephant
- Asian Elephant
- Mammoth

Systems stressed:

- tusks
- trunk traits
- long gestation
- large body size
- extinct reconstruction
- low reproductive rate

Expected difficulty:

Medium.

Proboscidea is useful for testing long-generation megafauna.

---

### 4. Reptilia

Possible species:

- Komodo Dragon
- Crocodile
- Tortoise

Systems stressed:

- egg laying
- incubation
- scales
- temperature-linked development
- slower growth
- different reproductive timing

Expected difficulty:

High.

Reptiles should not be attempted until reproduction adapters are more flexible.

---

## Portability Assessment By System

### Identity Layer

Status: Portable

Includes:

- id
- name
- speciesId
- generation
- founder IDs
- ancestor cache

No changes required.

---

### Pedigree Layer

Status: Portable

Includes:

- motherId
- fatherId
- lineage tracking
- founder tracking
- cached ancestry
- pedigree rendering

No changes required for mammalian lineages.

Future note:
Some egg-laying species may eventually need clutch/nest metadata, but parentage still works.

---

### D Layer

Status: Portable

Includes:

- expressed traits
- phenotype values
- visible morphology

The engine is portable.

Species-specific trait definitions must move into species adapters.

Examples:

Canidae:
- coat length
- ear type
- tail type

Felidae:
- mane type
- rosette pattern
- stripe density

Avian:
- feather type
- beak shape
- wing form

Proboscidea:
- tusk curvature
- trunk length
- ear size

---

### R Layer

Status: Portable

Includes:

- carrier traits
- hidden alleles
- recessive inheritance
- genotype carrier loci

No major changes required.

Species adapters must define their own loci.

---

### M Layer

Status: Portable

Includes:

- mutation generation
- mutation inheritance
- mutation tracking

The mutation engine is portable.

Mutation catalogs must become species-specific or clade-specific.

---

### Health Layer

Status: Mostly Portable

Includes:

- overall health
- health grade
- genetic robustness
- longevity potential
- system liabilities

Portable as a framework.

Needs species adapters for health categories.

Canidae example:
- hip dysplasia
- elbow dysplasia
- dental liability

Avian future example:
- keel deformity
- feather integrity
- respiratory sensitivity

Proboscidea future example:
- tusk disease
- joint stress
- molar wear

---

### Developmental Anomaly Layer

Status: Mostly Portable

Includes:

- developmental stability
- developmental risk score
- inherited liability
- inherited anomaly lineage
- generated anomalies
- risk breakdown audit

The audit engine is portable.

The anomaly catalog needs adapter support.

Canidae anomalies should not be assumed universal.

---

### Reproduction Layer

Status: Partially Portable

Current assumptions are mammal/live-birth oriented.

Needs adapter expansion for:

- live birth
- egg laying
- clutch size
- incubation
- gestation duration
- reproductive seasonality
- maternal/paternal care modes

This is the largest portability risk.

---

### Compatibility Layer

Status: Partially Portable

The compatibility engine is portable.

Compatibility values are species-specific.

Future model:

DRM provides:
- compatibility calculation interface
- compatibility result format

Species adapters provide:
- clade distance values
- hybrid rules
- realistic/sandbox permissions
- sterility modifiers
- mutation modifiers

---

### Population Testing

Status: Portable

Population testing is highly reusable.

Future improvements:

- species-specific benchmark suites
- adapter-defined test pairs
- batch comparison reports

---

## Required Species Adapter Shape

Each species adapter should eventually provide:

```txt
species-adapter/
├── species.json
├── traits.json
├── loci.json
├── phenotype-rules.json
├── mutation-catalog.json
├── health-profile.json
├── anomaly-profile.json
├── compatibility-rules.json
├── reproduction-rules.json
└── reconstruction-profile.json
```

---

## First True Portability Test

Recommended first target:

```txt
Felidae Lineages
```

Reason:

Felidae keeps enough assumptions close to Canidae to test portability without immediately requiring egg-laying or incubation systems.

First test species:

- Lion
- Tiger
- Leopard
- Smilodon

Minimum viable Felidae test:

1. Create founder animals.
2. Define Felidae loci.
3. Define basic coat/body traits.
4. Define basic health profile.
5. Define compatibility rules.
6. Generate offspring.
7. Run a 50-birth population test.
8. Verify risk audit still works.

Success condition:

No changes required to core DRM files.

Only species adapter data should change.

---

## What We Are NOT Doing Yet

We are not yet implementing:

- lions
- tigers
- birds
- mammoths
- reptiles
- real Felidae gameplay
- Project Genesis species database integration

Those are future implementation steps.

This document only defines the portability plan.

---

## Success Criteria For 1D.8D

1D.8D is complete when:

- major target clades are identified
- portability risks are documented
- adapter requirements are defined
- first real test target is chosen
- Felidae is selected as the first non-canid proof test

---

## Conclusion

DRM v0.2 is portable enough to justify extraction planning.

The biggest risks are:

1. reproduction assumptions
2. phenotype species specificity
3. compatibility data placement
4. anomaly catalog generalization

The best next technical step is:

```txt
1D.8E — DRM Package Architecture
```

The best future implementation test is:

```txt
Felidae Lineages MVP
```
