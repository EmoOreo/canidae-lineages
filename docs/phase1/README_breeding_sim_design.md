# README — Canid Breeding Simulation: Foundational Design Database

**Version:** 0.1.0  
**Stage:** Pre-code design documentation  
**Engine Target:** Browser-based WebGL (Godot / Three.js / Babylon.js compatible)  
**Mode:** Single-player, NPC-only economy, no multiplayer

---

## Overview

This repository contains the starter foundational design database for a browser-based canid breeding simulation. All Canidae species and lineages — extant, extinct, and hybrid — exist within the game world. The simulation supports two core modes:

- **Realistic Mode**: Restricts breeding to biologically plausible pairings based on taxonomy and documented hybrid records.
- **Sandbox Mode**: Allows all pairings across any two canids, including extinct and deeply divergent lineages, with instability penalties applied.

No application code is present in this stage. All files are structured game-design data intended to guide future implementation.

---

## File Index

| File | Purpose |
|---|---|
| `canid_compendium_starter.json` | Master reference sheet for all starter canid species |
| `trait_library_starter.json` | Reusable trait definitions covering morphology, coat, behavior, ecology, health, fertility, and 3D morph targets |
| `breeding_rules_starter.json` | Compatibility tiers, inheritance logic, fertility penalties, mutation rules, hybrid naming, and extinct DNA reconstruction |
| `README_breeding_sim_design.md` | This file |

---

## Starter Roster (12 Species)

| ID | Common Name | Status | Compatibility Group |
|---|---|---|---|
| canis_lupus_familiaris | Domestic Dog | Domesticated | Canis |
| canis_lupus | Gray Wolf | Extant | Canis |
| canis_latrans | Coyote | Extant | Canis |
| canis_aureus | Golden Jackal | Extant | Canis |
| vulpes_vulpes | Red Fox | Extant | Vulpes |
| vulpes_lagopus | Arctic Fox | Extant | Vulpes |
| vulpes_zerda | Fennec Fox | Extant | Vulpes_small |
| chrysocyon_brachyurus | Maned Wolf | Extant | SouthAmerican_Canini |
| lycaon_pictus | African Wild Dog | Extant | Lycaon |
| cuon_alpinus | Dhole | Extant | Cuon |
| aenocyon_dirus | Dire Wolf | Extinct | Aenocyon |
| borophagus_diversidens | Borophagus | Extinct | Borophaginae |

---

## Pairing Tier Summary

The breeding system uses **7 compatibility tiers** to determine fertility, instability, and sterility outcomes:

| Tier | Condition | Realistic | Sandbox | Base Compat | Sterile Chance |
|---|---|---|---|---|---|
| 1 | Same subspecies/breed | ✅ | ✅ | 1.00 | 0% |
| 2 | Same species, diff. subspecies | ✅ | ✅ | 0.95 | 0% |
| 3 | Same genus, diff. species | ✅ | ✅ | 0.80 | 5% |
| 4 | Same tribe, diff. genus | ❌ | ✅ | 0.40 | 35% |
| 5 | Same subfamily (Caninae), diff. tribe | ❌ | ✅ | 0.15 | 70% |
| 6 | Extinct Caninae × Extant | ❌ | ✅ | 0.30 | 45% |
| 7 | Borophaginae × Any | ❌ | ✅ | 0.05 | 90% |

---

## Trait Inheritance Summary

### Numeric Traits (body size, prey drive, fertility, etc.)
- Default: **midpoint blending** with normal-distribution variance (σ = 0.08)
- Polygenic traits use blending; simple numeric traits use tighter variance (σ = 0.03)
- Formula: `offspring_value = (p1 + p2) / 2 + N(0, 0.08)`

### Categorical Traits (ear type, coat pattern, tail type, etc.)
- Default: **dominant/recessive Mendelian**
- Each parent contributes one allele; dominant expressed if present
- Codominance possible for coat color traits
- Blending-categorical traits (e.g. vocalization) may produce intermediate values

### Boolean Traits (seasonal coat, etc.)
- Standard Mendelian: True (dominant) / False (recessive)

### Computed Traits
- `inbreeding_coefficient`: Computed from pedigree at breed-time
- `genetic_stability`: Computed from pairing tier + inbreeding
- `mutation_rate`: Derived from genetic_stability

---

## Genetic Stability & Mutations

Genetic stability is a core meta-trait that scales between 0.0 and 1.0:

- **0.8–1.0**: Stable lineage, minimal mutations (~1% per trait per generation)
- **0.5–0.8**: Mildly unstable, occasional mutations
- **0.3–0.5**: Unstable, regular mutations, reduced fertility
- **0.0–0.3**: Critically unstable — offspring are highly mutable, often sterile

**Mutation rate formula**: `mutation_chance = 0.01 + (1.0 - genetic_stability) × 0.20`

**Mutation types** (weighted): coat color shifts (30%), size variance (25%), trait flips (20%), stat variance (15%), novel patterns (7%), structural anomalies (3%).

---

## Extinct Species: DNA Reconstruction Mechanic

Extinct species (Aenocyon dirus, Borophagus diversidens, and future additions) require DNA reconstruction research before they become viable breeding participants.

| Stage | DNA Completeness | Breeding Allowed | Fertility Modifier |
|---|---|---|---|
| 1 – Fossil Record | 0%–25% | ❌ | — |
| 2 – Partial Genome | 25%–50% | ❌ | — |
| 3 – Draft Reconstruction | 50%–75% | ✅ (Sandbox) | ×0.40 |
| 4 – Advanced Reconstruction | 75%–90% | ✅ (Sandbox) | ×0.65 |
| 5 – Full Revival | 90%–100% | ✅ (Sandbox) | ×0.85 |

Research progress sources: fossil analysis missions, in-game research currency, NPC scientist events, player breeding data.

---

## Hybrid Naming Conventions

| Tier | Format | Example |
|---|---|---|
| Tier 3 (same genus) | Portmanteau or known hybrid name | Coywolf, Wolfdog, Coydog |
| Tier 4–5 (experimental) | EXP-[G1][G2] Gen[N] | EXP-CanLyc Gen1 |
| Tier 6 (extinct revival) | REVIVAL-[ExtinctID] Gen[N] | REVIVAL-DireWolf Gen3 |
| Tier 7 (ancient cross) | ANCIENT-[Bor]+[Extant] Gen[N] | ANCIENT-Bor+Wolf Gen1 |

Players may rename lineages once they reach stability and fertility thresholds.

---

## 3D Model Architecture

The system uses **model archetypes** as base meshes with **morph targets** applied per-individual:

| Archetype | Used By |
|---|---|
| large_canid_wolf_type | Gray Wolf, Dire Wolf |
| medium_canid_wolf_type | Domestic Dog, Coyote, Dhole |
| medium_canid_jackal_type | Golden Jackal |
| medium_canid_fox_type | Red Fox |
| small_canid_fox_type | Arctic Fox |
| tiny_canid_fennec_type | Fennec Fox |
| large_long_legged_canid | Maned Wolf |
| medium_canid_painted_type | African Wild Dog |
| heavy_canid_bone_crusher_type | Borophagus |

Morph targets are defined in `trait_library_starter.json` under `morph_targets_3d`. Each numeric morphological trait maps to one or more morph target IDs for runtime blending.

---

## Design Philosophy

1. **Reusable over hardcoded**: Traits and rules are generic and apply to any canid. Species-specific exceptions are minimized.
2. **Scalable tiers**: The 7-tier pairing system can be extended without restructuring — add new species with a `compatibilityGroup` and the rules apply automatically.
3. **Separation of modes**: Realistic vs. Sandbox is a mode flag, not a data restructuring. All pairings store tier data regardless of mode.
4. **Morph-target forward**: All morphological traits reference 3D morph target IDs now, so WebGL rendering can be connected later without refactoring trait data.
5. **DNA completeness as a progression axis**: Extinct species act as long-term research goals, adding depth beyond standard kennel management.

---

## Planned Expansions (Post-Starter)

- Full domestic dog breed roster with breed-level trait overrides
- South American canid expansion (bush dog, culpeo, Falkland Island wolf)
- Hesperocyoninae extinct subfamily additions
- Genetic disease trait system (hip dysplasia, MDR1, merle deafness, etc.)
- NPC competitor AI with kennel goals and buying/selling behavior
- Kennel economy: food, habitat, care, prestige scoring
- Achievement system tied to lineage milestones and de-extinction events

---

*All numeric values are gameplay-tuned approximations unless marked [SCIENTIFIC]. Values marked [APPROX] are reasonable estimates for simulation use.*
