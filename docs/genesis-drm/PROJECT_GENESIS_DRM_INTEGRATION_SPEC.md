# PROJECT GENESIS DRM INTEGRATION SPEC

## Status
Draft v0.1  
Based on DRM v0.2 Foundation Freeze from Canidae Lineages.

## Purpose
This document defines how Project Genesis consumes the DRM genetics foundation.

Canidae Lineages is the reference implementation. Project Genesis will treat DRM as a reusable genetics subsystem that can eventually support multiple animal lineages, extinct reconstructions, hybrids, and speculative organisms.

## Definitions

### DRM
DRM stands for:

- D — Development / Dominant visible trait expression layer
- R — Recessive / hidden carrier and inheritance layer
- M — Mutation / novel variation and instability layer

In Project Genesis, DRM is the genetics kernel responsible for creating, inheriting, mutating, auditing, and explaining animal outcomes.

## Integration Model

```txt
Project Genesis
    ↓
Species Template
    ↓
DRM Core
    ↓
Animal Instance
    ↓
Archive / Simulation / Breeding / Display Systems
```

## Required Animal Data

Every DRM-compatible animal should contain the following major data blocks.

### Identity
- id
- name
- speciesId
- generation
- taxonomic group
- extinct/extant/reconstructed status

### Parentage
- motherId
- fatherId
- motherName
- fatherName
- ancestry snapshot
- founder IDs
- cached ancestor IDs

### Genome
- D traits
- R carriers
- M mutations
- lineage composition

### Genotype
- loci
- allele pairs
- inherited mutations

### Phenotype
- visible trait values
- derived biological traits
- fertility rate
- mutation rate
- DNA completeness
- inbreeding coefficient
- domestication score where applicable

### Sex Development
- chromosomal sex
- gonadal sex
- phenotypic sex
- reproductive role
- developmental anomalies

### Reproduction
- pregnancy state
- gestation progress
- litter count
- current sire
- reproductive eligibility

### Health
- overall health
- health grade
- genetic robustness
- longevity potential
- system-specific liabilities
- health notes

### Developmental Risk
- developmental stability
- developmental risk score
- inherited developmental liability
- inherited anomaly lineage
- generated anomalies
- risk factors
- risk breakdown

### Statistics
- fertility
- stability

## Species Template Requirements

Every species template should define:

### Required
- species id
- common name
- taxonomy
- extant/extinct status
- baseline fertility
- baseline stability
- DNA completeness
- founder genotype template
- phenotype rules
- ecological traits

### Recommended
- domestication score
- habitat preference
- diet specialization
- climate tolerance
- body size range
- reproductive style
- gestation/incubation model
- litter/clutch range

## How Project Genesis Creates Animals

Project Genesis creates animals through one of five pathways.

### Founder Creation
Used when starting a new species population.

Inputs:
- species template
- founder genotype
- baseline phenotype
- baseline health profile
- baseline developmental profile

Output:
- generation 0 animal

### Breeding
Used when two animals produce offspring.

Inputs:
- parent A
- parent B
- compatibility result
- mutation catalog
- phenotype rules
- inbreeding result

Output:
- one or more offspring animals

### Reconstruction
Used for extinct or incomplete organisms.

Inputs:
- species template
- DNA completeness
- reconstruction confidence
- living reference species
- anomaly/developmental risk modifiers

Output:
- reconstructed founder or reconstructed hybrid

### Archive Generation
Used for non-playable catalog entries.

Inputs:
- species identity
- taxonomic metadata
- known traits

Output:
- lightweight archive specimen

### Simulation Batch
Used for population testing.

Inputs:
- selected parents
- target births
- mode
- ruleset

Output:
- preview population report, not persistent animals unless explicitly saved

## Breeding Flow

```txt
Select Parents
    ↓
Resolve Reproductive Roles
    ↓
Resolve Compatibility
    ↓
Calculate Inbreeding
    ↓
Resolve Genotype
    ↓
Resolve Phenotype
    ↓
Resolve Mutation
    ↓
Resolve Health
    ↓
Resolve Developmental Risk
    ↓
Generate Anomalies
    ↓
Apply Audit
    ↓
Create Offspring
```

## Project Genesis Display Requirements

The user-facing display should prioritize fast interpretation.

Every animal detail page should answer:

```txt
What is it?
Should I care?
Can I breed it?
Why did it turn out this way?
```

Minimum display sections:

- identity summary
- health summary
- fertility summary
- inbreeding summary
- mutation summary
- developmental risk audit
- genotype details
- phenotype details
- pedigree
- lineage composition

## Archive Integration

The Archive should store both biological identity and simulation state.

### Biological Identity
- species
- taxonomy
- status
- ecology
- morphology

### Simulation State
- genotype
- phenotype
- health
- fertility
- mutations
- anomalies
- lineage
- pedigree

## DRM Portability Rules

To be reusable across Project Genesis:

### DRM Core Must Stay Species-Agnostic
Examples:
- inheritance mechanics
- mutation application
- pedigree tracking
- risk auditing
- population testing

### Species Packs Should Carry Species-Specific Logic
Examples:
- coat colors
- scale patterns
- feather types
- antler/horn structures
- gestation/incubation values
- clade-specific compatibility rules

## Canidae-Specific Systems To Separate Later

The following are currently part of Canidae Lineages and should not be assumed universal:

- canid coat rules
- canid ear carriage
- canid tail carriage
- Caninae compatibility values
- dire wolf reconstruction assumptions
- canid-specific vocalization traits
- canid-specific developmental anomaly weighting

## Future DRM v1.0 Hooks

DRM v0.2 intentionally does not implement:

- chromosomal architecture
- sex-linked inheritance
- mitochondrial inheritance
- epigenetics
- advanced polygenic trait maps
- population-scale drift
- speciation

These are future systems and should be integrated only after the v0.2 foundation is fully portable.

## Current Integration Decision

DRM v0.2 should be treated as:

```txt
Stable enough to build on.
Not final enough to generalize blindly.
```

Project Genesis should use Canidae Lineages as the testbed, then extract DRM only after the canid-specific logic is clearly separated.

## Immediate Next Steps

1. Complete DRM Core Audit.
2. Complete Canid-Specific Audit.
3. Define first non-canid portability target.
4. Plan DRM package folder structure.
5. Build a small species-portability prototype.
