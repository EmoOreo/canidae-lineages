# Phase 2 Implementation Roadmap

## Project Status

Phase 1 is complete.

The design foundation now includes:

- Species compendium
- Trait library
- Breeding rules
- D/R/M/L genetics specification
- Lineage system
- Mutation catalog
- Phase 1 completeness audit

Phase 2 begins implementation. The goal is not to build the full game yet. The goal is to create a small playable breeding prototype that proves the core simulation works.

---

# Phase 2 Goal

Build a working single-player canid breeding prototype.

The prototype should be able to:

1. Load species, traits, breeding rules, mutations, and DRML genome data.
2. Create individual animals from species templates.
3. Breed two animals.
4. Generate offspring using D/R/M/L inheritance.
5. Display the offspring genome, phenotype, stats, lineage, fertility, and stability.
6. Save basic pedigrees.
7. Prove Realistic Mode and Sandbox Mode produce different outcomes.

No 3D is required in Phase 2A.

---

# Phase 2A — Core Breeding Prototype

## Objective

Implement the minimum playable simulation loop.

## Required Systems

### 1. Data Loader

Loads:

- `canid_compendium_starter.json`
- `trait_library_starter.json`
- `breeding_rules_starter.json`
- `MUTATION_CATALOG_V1.json`

Responsibilities:

- Validate JSON files.
- Confirm required fields exist.
- Normalize IDs.
- Build runtime lookup maps.

---

### 2. Animal Genome Model

Create the individual animal structure.

Recommended fields:

```json
{
  "id": "animal_001",
  "displayName": "Gray Wolf 001",
  "speciesTemplate": "canis_lupus",
  "generation": 0,
  "sex": "female",
  "genome": {
    "D": {},
    "R": {},
    "M": [],
    "L": {
      "canis_lupus": 100
    }
  },
  "phenotype": {},
  "stats": {
    "health": 0.8,
    "fertility": 0.8,
    "stability": 0.9,
    "temperament": 0.5,
    "trainability": 0.4,
    "preyDrive": 0.7,
    "endurance": 0.7
  },
  "motherId": null,
  "fatherId": null,
  "inbreedingCoefficient": 0.0
}
```

---

### 3. Founder Animal Generator

Creates starting animals from species templates.

Starter founders:

- Domestic Dog
- Gray Wolf
- Coyote
- Red Fox
- Fennec Fox
- Dire Wolf

Each founder should receive:

- Species lineage at 100%
- Baseline stats from compendium
- Default traits from trait library
- Empty mutation list unless manually assigned

---

### 4. Breeding Engine

Core function:

```txt
breed(parentA, parentB, mode) -> offspringResult
```

Modes:

- `realistic`
- `sandbox`

The engine should calculate:

1. Compatibility tier
2. Conception chance
3. Lineage blend
4. Dominant trait inheritance
5. Recessive carrier inheritance
6. Mutation roll
7. Stability score
8. Fertility score
9. Inbreeding coefficient
10. Offspring phenotype
11. Hybrid label
12. Pedigree fields

---

### 5. Compatibility Resolver

Reads breeding rules and determines:

- Allowed in Realistic Mode?
- Allowed in Sandbox Mode?
- Compatibility multiplier
- Fertility penalty
- Stability penalty
- Sterility chance
- Mutation modifier

Example output:

```json
{
  "tier": 3,
  "label": "same_genus",
  "realisticAllowed": true,
  "sandboxAllowed": true,
  "compatibility": 0.75,
  "sterilityChance": 0.05,
  "mutationModifier": 1.25
}
```

---

### 6. Lineage Resolver

Uses the D/R/M/L system.

Rules:

- Parent lineages average 50/50.
- Matching IDs merge.
- Total always normalizes to 100.
- Extinct ancestry persists.
- Below 5% becomes archive-only for phenotype influence.

Example:

```txt
Parent A: 100% Gray Wolf
Parent B: 100% Coyote

Offspring:
50% Gray Wolf
50% Coyote
```

---

### 7. Trait Resolver

Implements:

- Dominant expression
- Recessive carrier storage
- Recessive expression when both parents carry the same allele
- Mutation override
- Conflict resolution
- Lineage-weighted adjustment

Resolution order:

1. Assemble parental genome inputs.
2. Build lineage percentages.
3. Resolve inherited dominant traits.
4. Resolve recessive carrier states.
5. Apply mutation entries.
6. Apply trait conflicts.
7. Apply lineage weighting.
8. Apply stability/fertility/inbreeding modifiers.
9. Clamp output values.
10. Emit phenotype.

---

### 8. Mutation Resolver

Uses mutation catalog.

The system should:

- Roll base mutation chance.
- Modify chance based on stability, inbreeding, compatibility, and hybrid distance.
- Select mutation by weighted rarity.
- Apply stat, fertility, and stability modifiers.
- Store mutation in `M`.

Minimum implementation:

- No mutation
- One mutation
- Multiple mutations disabled until later

---

### 9. Phenotype Generator

Converts genome into visible description.

Phase 2A phenotype can be text-based.

Example output:

```txt
Large wolf-like hybrid with tawny coat, long muzzle, bushy tail, high prey drive, and moderate fertility.
```

No 3D required yet.

---

### 10. Pedigree Tracker

Stores:

- Mother ID
- Father ID
- Generation
- Lineage ancestry
- Inbreeding coefficient
- Hybrid label

Minimum pedigree depth:

- 3 generations

---

# Phase 2A UI

Simple web UI is enough.

## Required Screens

### 1. Animal List

Shows:

- Name
- Species / hybrid label
- Generation
- Sex
- Fertility
- Stability

### 2. Animal Detail

Shows:

- D traits
- R carriers
- M mutations
- L lineage breakdown
- Stats
- Parents
- Phenotype text

### 3. Breeding Lab

Allows:

- Select Parent A
- Select Parent B
- Choose Realistic or Sandbox Mode
- Preview compatibility
- Click Breed
- Show offspring result

### 4. JSON Debug Panel

Shows raw offspring object.

This is important for testing.

---

# Phase 2A Acceptance Criteria

Phase 2A is complete when:

- The app loads all Phase 1 JSON files.
- The app creates at least 6 founder animals.
- The player can breed Wolf × Dog.
- The player can breed Wolf × Coyote.
- Realistic Mode blocks or heavily penalizes Fox × Wolf.
- Sandbox Mode allows Fox × Wolf with instability.
- Offspring receives valid D/R/M/L genome.
- Lineage percentages total 100.
- Mutation system can produce at least one mutation.
- Pedigree data is stored.
- Results display clearly in the UI.

---

# Phase 2B — Save System and Balancing

## Objective

Make the prototype persistent and testable.

Required additions:

- Local save/load
- Export save JSON
- Import save JSON
- Breeding history log
- Mutation history log
- Basic balance tuning file
- Validation tests for lineage totals and stat bounds

Acceptance criteria:

- User can refresh page without losing animals.
- User can export/import kennel data.
- Broken genomes are rejected or repaired.

---

# Phase 2C — Visual Prototype

## Objective

Connect phenotype to WebGL visuals.

Required additions:

- 3D viewer
- Species archetype mapping
- Placeholder realistic canid models
- Morph target mapping
- Coat/material slots
- Basic idle animation

Suggested first visual archetypes:

- Wolf archetype
- Fox archetype
- Wild dog archetype
- Heavy extinct canid archetype

Acceptance criteria:

- Animal detail screen shows a 3D model.
- Lineage affects model archetype.
- Traits affect at least 3 visual properties.
- Coat color or pattern changes based on genome.

---

# Phase 2D — NPC Breeder Prototype

## Objective

Replace multiplayer systems with in-game NPC breeders.

Required systems:

- NPC kennels
- NPC breeder archetypes
- NPC breeding goals
- NPC animal listings
- Basic market prices
- Basic competition rankings

Starter NPC archetypes:

- Conservationist
- Show Breeder
- Working Breeder
- Geneticist
- Extinct Species Research Lab
- Collector

Acceptance criteria:

- NPCs own animals.
- NPCs generate offspring over time.
- NPCs list animals for sale or exchange.
- Player can acquire NPC animals.
- NPC lines persist.

---

# Recommended Tech Stack

## Web Prototype

Recommended:

- Vite
- TypeScript
- React or plain TypeScript UI
- Three.js later for WebGL
- LocalStorage or IndexedDB for saves

Simplest start:

```txt
Vite + TypeScript
```

Avoid adding Three.js until Phase 2C.

---

# Suggested Repository Structure

```txt
canid-breeder-sim/
├── README.md
├── docs/
│   ├── phase1/
│   │   ├── README_breeding_sim_design.md
│   │   ├── drml-specification.md
│   │   ├── LINEAGE_SYSTEM.md
│   │   ├── phase-1-completeness-audit.md
│   └── phase2/
│       └── PHASE2_IMPLEMENTATION_ROADMAP.md
├── data/
│   ├── canid_compendium_starter.json
│   ├── trait_library_starter.json
│   ├── breeding_rules_starter.json
│   └── MUTATION_CATALOG_V1.json
├── src/
│   ├── main.ts
│   ├── data/
│   ├── genetics/
│   ├── breeding/
│   ├── lineage/
│   ├── ui/
│   └── types/
├── public/
├── package.json
└── vite.config.ts
```

---

# First Implementation Order

1. Create repo.
2. Commit Phase 1 files.
3. Tag `v0.1-design-foundation`.
4. Create Vite TypeScript project.
5. Add data loading.
6. Add TypeScript interfaces.
7. Add founder generator.
8. Add compatibility resolver.
9. Add lineage resolver.
10. Add breeding function.
11. Add basic UI.
12. Add save/load.
13. Begin WebGL only after the breeding loop works.

---

# Risk Register

## Risk 1: Too much realism too early

Solution:
Use gameplay-tuned values. Realistic Mode should feel plausible, not biologically perfect.

## Risk 2: Hybrid naming chaos

Solution:
Use deterministic naming rules and stable lineage IDs.

## Risk 3: Mutation stacking gets messy

Solution:
Limit Phase 2A to 0-1 mutation per offspring.

## Risk 4: 3D distracts from genetics

Solution:
Do not add WebGL until the text-based breeding loop works.

## Risk 5: Data drift

Solution:
Add validation scripts before expanding to dozens of species.

---

# Phase 2A Definition of Done

Phase 2A is done when a user can open the browser, select two canids, choose Realistic or Sandbox Mode, breed them, and receive a valid offspring with:

- Name
- Species/hybrid label
- D traits
- R carriers
- M mutations
- L lineage percentages
- Stats
- Fertility score
- Stability score
- Parent links
- Phenotype description

At that point the project has crossed from design document into playable prototype.
