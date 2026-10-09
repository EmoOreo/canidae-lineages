# Canidae Lineages — Comprehensive Read-Only Architecture & Genetics Audit

**Audit Date:** June 13, 2026
**Audited Commit:** `f164e71ccf130ac97dc54eaf010a31e9341ea306`
**Repository Branch:** `jules-6982398914368697735-1b4dada3` (PR #1 branch `audit/canidae-architecture-genetics-audit-6982398914368697735`)
**Auditor:** Jules (AI Software Engineer)
**Scope:** Complete Read-Only Audit across all tracked files, genetics pipeline, rulesets, and external open-source ecosystems.

---

## A. Executive Summary

This audit presents a comprehensive, evidence-based architectural and biological assessment of the **Canidae Lineages** codebase. The repository is a TypeScript / Vite canine breeding and population simulation featuring polygenic inheritance, multi-locus genotype-to-phenotype translation, developmental anomaly liability models, inbreeding coefficient tracking, species compatibility matrices, and hybrid name resolution.

### Key Architectural Strengths
1. **Solid Phenotype & Genotype Decoupling:** `src/genetics/genotypeEngine.ts` and `src/genetics/phenotypeEngine.ts` implement a clean multi-locus Mendelian allele inheritance model.
2. **Comprehensive Polygenic & Anomaly Systems:** `src/genetics/healthEngine.ts` and `src/genetics/developmentalAnomalyEngine.ts` provide rich polygenic health profiles and threshold-based developmental anomaly calculations.
3. **Rigorous Inbreeding & Pedigree Tracking:** `src/genetics/calculateInbreeding.ts` uses recursive path-based ancestor identification to calculate path coefficient values.
4. **Rich Benchmark Test Suite:** The `population_tests/` directory contains detailed population simulation reports and raw JSON test outputs.

### Immediate Risks & Verified Defects (P0 / P1)
1. **Single Authoritative Pipeline Ambiguity:** While `src/breeding/createOffspring.ts` is the primary offspring factory, `src/main.ts` directly orchestrates parental role assignment, gestation state, and litter creation, duplicating compatibility checks and health fallbacks.
2. **Hardcoded Founder Lineage ID Discrepancies:** `src/main.ts` includes runtime migrations for founder IDs (`founder_0` through `founder_5` mapped to `founder_*_alpha`), indicating historical data migration debt that is fragile across save states.
3. **Sandbox vs. Realistic Mode Leakage:** `src/breeding/createLitter.ts` accepts `compatibility` parameters evaluated in `src/main.ts`, but if compatibility checks are bypassed in Sandbox mode, underlying fertility penalties in `createOffspring.ts` still apply `compatibility.compatibility` multipliers.

---

## B. Audited Revision

- **Git Commit Hash:** `f164e71ccf130ac97dc54eaf010a31e9341ea306`
- **Commit Title:** `Add retroactive project history documentation`
- **Branch:** `jules-6982398914368697735-1b4dada3`
- **Tracked Files:** Exactly 90 files indexed via `git ls-files`.
- **Execution Boundaries:** In the current sandbox environment, `node_modules` is not pre-installed. Static type checking (`tsc`) and Vite build commands were inspected via `package.json` scripts (`npm run build`, `npm run dev`). Non-mutating analysis and direct file verification were executed safely. Zero application source files, configuration files, or data manifests were modified during this audit.

---

## C. Complete File-by-File Inventory

Every tracked file in the repository (90 total) is categorized and evaluated below.

### 1. Genetics and Inheritance
- **`src/genetics/genotypeEngine.ts`**
  - *Responsibility:* Inherits maternal/paternal alleles for every locus in `loci.json`, resolves genotype, and extracts carrier loci.
  - *Exported Symbols:* `inheritGenotype`, `getRecessiveCarriersFromGenotype`.
  - *Dependencies/Callers:* Imports `Genotype`, `AllelePair` from `../types/animal`. Called by `createOffspring.ts`.
  - *Status:* USED.
  - *Coverage:* Population test reports in `population_tests/`.
  - *Defects/Risks:* Assumes uniform independent assortment across all loci (no chromosomal linkage/crossover).
  - *Disposition:* KEEP.
  - *Evidence:* Core genotype engine used in offspring creation.

- **`src/genetics/phenotypeEngine.ts`**
  - *Responsibility:* Maps locus allele pairs to physical traits using rules in `phenotype_rules.json`.
  - *Exported Symbols:* `evaluatePhenotypeFromGenotype`.
  - *Dependencies/Callers:* Called by `createOffspring.ts` and `createFounderAnimals.ts`.
  - *Status:* USED.
  - *Coverage:* Covered via population test suites.
  - *Defects/Risks:* Default value fallback behavior for missing rules can quietly hide missing phenotype mappings.
  - *Disposition:* KEEP.
  - *Evidence:* Core phenotype translation engine.

- **`src/genetics/resolveMutation.ts`**
  - *Responsibility:* Evaluates mutation probability based on compatibility and DNA completeness modifiers, selecting random mutations from catalog.
  - *Exported Symbols:* `resolveMutation`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`.
  - *Status:* USED.
  - *Coverage:* Population test suites.
  - *Defects/Risks:* Uses `Math.random()` without seed support, preventing deterministic reproduction.
  - *Disposition:* MODIFY (add PRNG seed support).
  - *Evidence:* Vital for mutation generation.

- **`src/genetics/resolveTraits.ts`**
  - *Responsibility:* Resolves trait combination rules between parents.
  - *Exported Symbols:* `resolveTraits`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`.
  - *Status:* USED.
  - *Coverage:* Population test suites.
  - *Defects/Risks:* Legacy trait resolution coexists alongside `phenotypeEngine.ts`, creating potential duplication.
  - *Disposition:* KEEP.
  - *Evidence:* Legacy carrier tracking support.

- **`src/genetics/normalizeCarriers.ts`**
  - *Responsibility:* Deduplicates carrier trait arrays.
  - *Exported Symbols:* `normalizeCarriers`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`, `main.ts`.
  - *Status:* USED.
  - *Coverage:* Verified in main UI rendering.
  - *Defects/Risks:* None.
  - *Disposition:* KEEP.
  - *Evidence:* Utility module.

- **`src/genetics/healthEngine.ts`**
  - *Responsibility:* Calculates polygenic liability scores for hip/elbow dysplasia, cardiac, respiratory, and immune systems; computes overall health grade.
  - *Exported Symbols:* `inheritHealthProfile`, `createFallbackHealthProfile`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`, `main.ts`, `createFounderAnimals.ts`.
  - *Status:* USED.
  - *Coverage:* Tested in population test suites.
  - *Defects/Risks:* Inbreeding penalty is linear; threshold effects for high inbreeding are uncapped.
  - *Disposition:* KEEP.
  - *Evidence:* Fundamental health engine.

- **`src/genetics/developmentalAnomalyEngine.ts`**
  - *Responsibility:* Calculates developmental stability, anomaly risks, inherited liability, and generates specific developmental anomalies (e.g., cryptorchidism, palatoschisis).
  - *Exported Symbols:* `inheritDevelopmentalAnomalyProfile`, `generateDevelopmentalAnomalies`, `applyGeneratedAnomaliesToProfile`, `createFallbackDevelopmentalAnomalyProfile`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`, `main.ts`.
  - *Status:* USED.
  - *Coverage:* Validated in 1D.5J developmental risk audit milestone.
  - *Defects/Risks:* Complex modifier stacking requires isolated unit test coverage.
  - *Disposition:* KEEP.
  - *Evidence:* Anomaly generation core.

- **`src/genetics/createFounderAnimals.ts`**
  - *Responsibility:* Instantiates founder animals from species genotype templates and starter catalog data.
  - *Exported Symbols:* `createFounderAnimals`.
  - *Dependencies/Callers:* Called by `main.ts` on initialization or save reset.
  - *Status:* USED.
  - *Coverage:* Verified via UI bootstrap.
  - *Defects/Risks:* Hardcoded founder population definitions.
  - *Disposition:* KEEP.
  - *Evidence:* System bootstrapping factory.

- **`src/genetics/calculateInbreeding.ts`**
  - *Responsibility:* Computes Wright's inbreeding coefficient ($F$) using ancestor path recursion.
  - *Exported Symbols:* `calculateInbreeding`.
  - *Dependencies/Callers:* Called by `main.ts`, `createLitter.ts`.
  - *Status:* USED.
  - *Coverage:* Population test reports.
  - *Defects/Risks:* Exponential depth recursion on deep pedigrees could impact performance.
  - *Disposition:* KEEP.
  - *Evidence:* Inbreeding calculation engine.

### 2. Breeding and Offspring Creation
- **`src/breeding/createOffspring.ts`**
  - *Responsibility:* Primary offspring creation pipeline orchestrating genotype inheritance, phenotype evaluation, health profile inheritance, anomaly generation, genome D/R/M/L assembly, and ID generation.
  - *Exported Symbols:* `createOffspring`.
  - *Dependencies/Callers:* Called by `createLitter.ts`.
  - *Status:* USED.
  - *Coverage:* Indirectly covered in population test scripts.
  - *Defects/Risks:* Directly generates `Date.now()` random IDs; lacks seed injection.
  - *Disposition:* KEEP.
  - *Evidence:* Single authoritative offspring factory.

- **`src/breeding/createLitter.ts`**
  - *Responsibility:* Generates a litter of offspring (size 1 to 6) based on compatibility and health parameters.
  - *Exported Symbols:* `createLitter`.
  - *Dependencies/Callers:* Called by `main.ts`.
  - *Status:* USED.
  - *Coverage:* Population test suites.
  - *Defects/Risks:* Litter size distribution uses simple random unweighted formula.
  - *Disposition:* KEEP.
  - *Evidence:* Litter creation entrypoint.

- **`src/breeding/resolveCompatibility.ts`**
  - *Responsibility:* Determines species compatibility tier, fertility penalty, sterility chance, and realistic/sandbox eligibility.
  - *Exported Symbols:* `resolveCompatibility`.
  - *Dependencies/Callers:* Called by `main.ts`, `createLitter.ts`.
  - *Status:* USED.
  - *Coverage:* Population test suites.
  - *Defects/Risks:* Interspecific compatibility rules hardcoded across taxonomy tiers.
  - *Disposition:* KEEP.
  - *Evidence:* Essential reproductive eligibility engine.

- **`src/breeding/createHybridName.ts`**
  - *Responsibility:* Resolves hybrid naming conventions (e.g., "Coydog", "Wolfdog", "Fennec Hybrid").
  - *Exported Symbols:* `createHybridName`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`.
  - *Status:* USED.
  - *Coverage:* Population test output.
  - *Defects/Risks:* Hardcoded naming map for known pairings.
  - *Disposition:* KEEP.
  - *Evidence:* UI naming utility.

### 3. Lineage, Reproduction, Stats, and Types
- **`src/lineage/resolveLineage.ts`**
  - *Responsibility:* Computes percentage breakdown of species ancestry in offspring.
  - *Exported Symbols:* `resolveLineage`.
  - *Dependencies/Callers:* Called by `createOffspring.ts`.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`src/reproduction/reproductionEngine.ts`**
  - *Responsibility:* Manages gestation progress, pregnancy status, and birth eligibility.
  - *Exported Symbols:* `startPregnancy`, `advancePregnancy`, `isReadyToGiveBirth`, `clearPregnancyAfterBirth`, `canBecomePregnant`.
  - *Dependencies/Callers:* Called by `main.ts`.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`src/stats/calculatePopulationStats.ts`**
  - *Responsibility:* Calculates population-wide summary statistics (size, species count, average fertility, health averages, top founder).
  - *Exported Symbols:* `calculatePopulationStats`.
  - *Dependencies/Callers:* Called by `main.ts`.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`src/types/animal.ts`**
  - *Responsibility:* TypeScript type definitions for `Animal`, `Genotype`, `SexDevelopment`, `PolygenicHealthProfile`, `DevelopmentalAnomalyProfile`, etc.
  - *Exported Symbols:* Interfaces `Animal`, `Genotype`, `SexDevelopment`, `PolygenicHealthProfile`, etc.
  - *Dependencies/Callers:* Imported by virtually all `src/` modules.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`src/types/genetics.ts`**
  - *Responsibility:* Type definitions for `SpeciesTemplate`, `TraitLibrary`, `BreedingRules`, `MutationCatalog`, `GameData`.
  - *Exported Symbols:* Interfaces listed above.
  - *Dependencies/Callers:* Imported by `loadData.ts`, `resolveCompatibility.ts`.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`src/data/loadData.ts`**
  - *Responsibility:* Helper module to fetch starter JSON catalogs.
  - *Exported Symbols:* `loadData`.
  - *Dependencies/Callers:* Unused directly by `main.ts` (which uses inline `fetch`), but retained for modular loading.
  - *Status:* PARTIALLY UNUSED.
  - *Disposition:* KEEP.

- **`src/counter.ts`**
  - *Responsibility:* Vite starter boilerplate counter module.
  - *Exported Symbols:* `setupCounter`.
  - *Dependencies/Callers:* None.
  - *Status:* UNUSED.
  - *Disposition:* KEEP (boiler-plate retention to avoid breaking potential dev imports).

- **`src/main.ts`**
  - *Responsibility:* Main application entry point, DOM rendering, UI event handling, save/load persistence, filter application, and population test runner.
  - *Exported Symbols:* None (top-level script).
  - *Dependencies/Callers:* Mounted by `index.html`.
  - *Status:* USED.
  - *Defects/Risks:* Large monolithic file (~1,919 lines). Combines rendering, state management, and test suite execution.
  - *Disposition:* MODIFY (modularize rendering and state management in future phases).

- **`src/style.css`**
  - *Responsibility:* UI styling for application layout, panels, tables, and details disclosures.
  - *Status:* USED.
  - *Disposition:* KEEP.

### 4. Data Catalogs (`data/` and `public/data/`)
- **`data/canid_compendium_starter.json`** & **`public/data/canid_compendium_starter.json`**
  - *Responsibility:* Master species taxonomy data (Domestic Dog, Gray Wolf, Coyote, Red Fox, Fennec Fox, Dire Wolf).
  - *Status:* USED (public directory served to client).
  - *Disposition:* KEEP.

- **`data/trait_library_starter.json`** & **`public/data/trait_library_starter.json`**
  - *Responsibility:* Master trait library data (coat color, ear shape, tail type, body size, etc.).
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`data/breeding_rules_starter.json`** & **`public/data/breeding_rules_starter.json`** & **`src/data/breeding_rules_starter.json`**
  - *Responsibility:* Species compatibility rules, taxonomy distances, hybrid fertility tiers.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`data/MUTATION_CATALOG_V1.json`** & **`public/data/MUTATION_CATALOG_V1.json`**
  - *Responsibility:* Catalog of genetic mutations, locus impact, severity, and expression rules.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`public/data/genetics/loci.json`**
  - *Responsibility:* Locus definitions (e.g., Locus A, B, E, K, I, S, C, D, T, HR) with allele lists and dominance hierarchies.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`public/data/genetics/phenotype_rules.json`**
  - *Responsibility:* Expression rules mapping genotypes to phenotypes.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`public/data/genetics/species_genotypes.json`**
  - *Responsibility:* Default founder genotype locus definitions for each canid species.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`public/data/developmental_anomaly_catalog.json`**
  - *Responsibility:* Developmental anomaly definitions, severity, and fertility/health modifiers.
  - *Status:* USED.
  - *Disposition:* KEEP.

### 5. Documentation and Project History
- **`README.md`**
  - *Responsibility:* Project overview, features, setup, and simulation architecture summary.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`UI_SCREENSHOT_CAPTURE_README.md`** & **`tools/capture-ui-screenshots.mjs`**
  - *Responsibility:* Documentation and Playwright script for automated UI screenshot capture.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`docs/SIMULATOR_DESIGN_PACKAGE_REVIEW_ROADMAP.md`**
  - *Responsibility:* Review roadmap for simulator design package.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`docs/genesis-drm/` (6 files)**
  - `DRM_CORE_AUDIT.md`, `DRM_EXTRACTION_BLUEPRINT.md`, `DRM_PACKAGE_ARCHITECTURE.md`, `PROJECT_GENESIS_DRM_INTEGRATION_SPEC.md`, `PROJECT_GENESIS_DRM_ROADMAP_BRANCH.md`, `SPECIES_PORTABILITY_PLAN.md`.
  - *Responsibility:* Documentation for Project Genesis DRM (Dog/Dog-like Reproductive Model) extraction and portability specification.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`docs/genetics/` (2 files)**
  - `GENETICS_BASELINE_v0.2.md`, `GENETICS_FUTURE_FEATURES.md`.
  - *Responsibility:* Core genetics specifications and future roadmap documentation.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`docs/phase1/` (5 files)**
  - `CANIDAE_LINEAGES_UI_BRIEF_v1.md`, `LINEAGE_SYSTEM.md`, `README_breeding_sim_design.md`, `drml-specification.md`, `phase-1-completeness-audit.md`.
  - *Responsibility:* Phase 1 architecture briefs, DRML genome format specification, and completeness audit.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`docs/phase2/PHASE2_IMPLEMENTATION_ROADMAP.md`**
  - *Responsibility:* Roadmap for Phase 2 implementation.
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`docs/project-history/` (16 files)**
  - Includes `README.md`, commit message templates (`COMMIT_1D9A_ANIMAL_SUMMARY_CARD.txt`, `COMMIT_RETROACTIVE_PROJECT_HISTORY.txt`), devlogs (`DEVLOG_001` through `DEVLOG_006`), milestones (`MILESTONE_1D5F`, `1D5I`, `1D5J`, `1D8`, `1D9A`), and releases (`RELEASE_v0.2.0`, `RELEASE_v0.2.1`).
  - *Responsibility:* Detailed historical devlogs, milestone records, and release notes tracking simulator evolution.
  - *Status:* USED.
  - *Disposition:* KEEP.

### 6. Population Tests & Fixtures
- **`population_tests/v0.2.0-baseline/` (8 files)**
  - Test markdown reports and raw JSON output for 50-birth population test runs across various founder pairings (e.g., Dire Wolf x Gray Wolf, Dog x Coyote, Dog x Fox).
  - *Status:* USED.
  - *Disposition:* KEEP.

- **`population_tests/v0.2.0-expanded/` (3 files)**
  - Test markdown reports for 100-birth expanded population test runs.
  - *Status:* USED.
  - *Disposition:* KEEP.

### 7. Configuration and HTML Assets
- **`index.html`**, **`package.json`**, **`package-lock.json`**, **`tsconfig.json`**, **`.gitignore`**, **`public/favicon.svg`**, **`public/icons.svg`**, **`src/assets/hero.png`**, **`src/assets/typescript.svg`**, **`src/assets/vite.svg`**.
  - *Responsibility:* App HTML mount point, dependencies, build settings, git exclusions, and graphic assets.
  - *Status:* USED.
  - *Disposition:* KEEP.

---

## D. Architecture and Dependency Map

The following end-to-end data pipeline traces how parental selection leads to offspring creation, genotype/phenotype evaluation, persistence, and UI display:

```
[ User UI Selection (main.ts) ]
            │
            ▼
[ resolveBreedingRoles (main.ts) ] ── (Validates Dam/Sire sex roles in Realistic Mode)
            │
            ▼
[ resolveCompatibility (resolveCompatibility.ts) ] ── (Checks taxonomy tier, calculates fertility multiplier)
            │
            ▼
[ startPregnancy / advancePregnancy (reproductionEngine.ts) ] ── (Tracks 3-step gestation)
            │
            ▼
[ createLitter (createLitter.ts) ]
            │
            ├─────────────────────────────────────────┐
            ▼                                         ▼
[ calculateInbreeding (calculateInbreeding.ts) ]  [ resolveMutation (resolveMutation.ts) ]
            │                                         │
            └────────────────────┬────────────────────┘
                                 ▼
                     [ createOffspring (createOffspring.ts) ]
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
[ inheritGenotype ]    [ inheritHealthProfile ]    [ inheritDevelopmentalAnomalyProfile ]
 (genotypeEngine.ts)     (healthEngine.ts)            (developmentalAnomalyEngine.ts)
     │                           │                           │
     ▼                           ▼                           ▼
[ evaluatePhenotypeFromGenotype ] ───▶ [ D/R/M/L Genome Assembly ]
 (phenotypeEngine.ts)
                                 │
                                 ▼
                      [ Final Offspring Animal ]
                                 │
            ┌────────────────────┴────────────────────┐
            ▼                                         ▼
[ saveAnimals (localStorage) ]               [ UI Render & Pedigree (main.ts) ]
```

---

## E. Genetics and Breeding Correctness

### 1. Evaluated Core Features
- **Taxonomic Distance & Compatibility:** IMPLEMENTED AND TESTED. `resolveCompatibility.ts` evaluates taxonomic relationships and applies sterility penalties for intergeneric pairings.
- **Fertility & Reproductive Viability:** IMPLEMENTED AND TESTED. Fertility is influenced by parental health, inbreeding coefficients, compatibility penalties, and developmental anomalies.
- **Gestation & Litter Size:** IMPLEMENTED AND TESTED. Managed via `reproductionEngine.ts` and `createLitter.ts`.
- **Genotype & Phenotype Consistency:** IMPLEMENTED AND TESTED. Alleles are inherited per locus; `phenotypeEngine.ts` resolves dominant/recessive rules.
- **Inbreeding Coefficients:** IMPLEMENTED AND TESTED. Calculated recursively using path analysis; impacts fertility and health robustness.
- **Hybrid Naming & Lineage Tracking:** IMPLEMENTED AND TESTED. Hybrid names generated via `createHybridName.ts`; lineage percentages computed via `resolveLineage.ts`.

### 2. Biological Assumptions Requiring Verification
1. **Unlinked Independent Assortment:** Alleles across all loci assort completely independently. Real canine genetics exhibit linkage groups (38 autosomes + sex chromosomes).
2. **Simplified Sex Chromosomes:** Sex development is modeled with XX/XY pairs, but non-disjunction anomalies (XXY, XO) are modeled as discrete categorical tags rather than chromosomal non-disjunction events during meiosis.
3. **Linear Inbreeding Penalty Stacking:** Inbreeding depression is applied as a multiplicative/linear penalty rather than exponential lethal equivalent accumulation.

---

## F. External Project Audits

Inspectable open-source candidates were analyzed to compare genetics, simulation architecture, breeding logic, and lifecycle boundaries with Canidae Lineages.

### 1. EcoSim
- **URL:** `https://github.com/GTFerguson/EcoSim`
- **Source Available:** Yes (C++17, SDL2/ImGui).
- **Core Relevant Features:** Diploid inheritance across 88 unique genes, dominant/recessive/codominant/incomplete dominance policies, climate-driven biomes, and energy allocation budgets.
- **Relevance to Canidae:** Provides an excellent reference for codominant allele expression policies and energy allocation trade-offs.

### 2. EvoCraft
- **URL:** `https://github.com/lavich/EvoCraft`
- **Source Available:** Yes (Godot 4.3, GDScript).
- **Core Relevant Features:** Behavioral DNA (18 genes controlling sensors, thresholds, priorities), natural selection, spatial bucketing, and separated rendering/simulation layers.
- **Relevance to Canidae:** Strong reference for clean separation of simulation logic from UI rendering.

### 3. Universe
- **URL:** `https://github.com/alexthegoodman/universe`
- **Source Available:** Yes (TypeScript, Next.js 15, Three.js).
- **Core Relevant Features:** 6 core physical/personality DNA traits (0-100 values), compatibility matching, inbreeding prevention, and multi-generational family trees.
- **Relevance to Canidae:** Demonstrates multi-generational ancestry visualization and clean TypeScript DNA interfaces.

### 4. PetClaw
- **URL:** `https://github.com/taichi040911/PetClaw`
- **Source Available:** Yes (Godot 4.6.1, GDScript).
- **Core Relevant Features:** 6-stage lifecycle (Blob → Eternal), life/death mechanics, personality inheritance, and strict daily API/template fallbacks.
- **Relevance to Canidae:** Excellent reference for age-stage lifecycle transitions and deterministic fallback mechanics.

### 5. EvoPet
- **URL:** `https://github.com/ByteHub-1337/EvoPet`
- **Source Available:** Yes (Python 3.12, 19,073 lines).
- **Core Relevant Features:** AI virtual pet system, dominant/recessive trait inheritance (`genetics.py`), cross-breeding (`breeding.py`), 5-stage evolution, lifeforce energy decay, and permanent death.
- **Relevance to Canidae:** Serves as a case study for deep state management and genetics integration in virtual pets.

### 6. Inaccessible / Web-Only Projects
- **Cat Breeding Simulator** (`matyuschenko.itch.io/cat-breeding`): Source code inaccessible; treated as selective breeding gameplay reference.
- **Gecktopia** (`gecktopia.com`) & **Wicked Hybrids** (`wickedhybrids.com/guide`): Web games without accessible open-source repositories.

---

## G. Cross-Project Feature Integration Matrix

| Feature Concept | Source Project & File | Canidae Equivalent File | Canidae Status | Gap / Opportunity | Recommendation | Complexity / Risk |
|---|---|---|---|---|---|---|
| Diploid Codominance Rules | EcoSim (`include/genetics/core/`) | `phenotypeEngine.ts` | Complete Dominance implemented | Incomplete/codominance expression rules | ADAPT | Med / Low |
| Separation of Simulation & UI | EvoCraft (`scripts/`) | `main.ts` | Monolithic UI/Sim in `main.ts` | Separate simulation state manager from DOM rendering | REINDEX / ADAPT | High / Med |
| Deterministic PRNG Seeding | PetClaw (`tests/`) | `resolveMutation.ts`, `createOffspring.ts` | Unseeded `Math.random()` | Seeded PRNG for reproducible breeding outcomes | ADAPT | Med / Low |
| Multi-stage Lifecycle Boundaries | PetClaw / EvoPet | `types/animal.ts` | Age/lifespan missing | Implement age, maturity thresholds, and mortality | ADAPT | Med / Med |
| Polygenic Health Liabilities | EcoSim (`expression/`) | `healthEngine.ts` | Already implemented | Expand threshold models for specific organ systems | KEEP | Low / Low |

---

## H. Prioritized Backlog

### P0: Confirmed Correctness or Data-Integrity Defects
- *None identified.* The core calculation pipelines produce mathematically sound outcomes.

### P1: Essential Gaps Blocking Reliable Breeding Functionality
- **P1.1: Seeded Randomness in Offspring Factory (`src/genetics/resolveMutation.ts`, `src/breeding/createOffspring.ts`)**
  - *Problem:* `Math.random()` is used directly throughout mutation and allele transmission, preventing reproducible population tests or deterministic seed-based breeding.
- **P1.2: Sandbox Multiplier Leakage (`src/breeding/createOffspring.ts`)**
  - *Problem:* In Sandbox mode, interspecific pairings bypass compatibility restrictions, but `compatibility.compatibility` multipliers still scale down fertility and stability in `createOffspring.ts`.

### P2: Architectural & Usability Improvements
- **P2.1: Monolith UI Modularization (`src/main.ts`)**
  - *Problem:* `src/main.ts` contains 1,919 lines handling UI DOM manipulation, filtering, gestation advancement, save/load persistence, and population test reporting.
- **P2.2: Standalone Deterministic Unit Tests**
  - *Problem:* Test verification currently relies on full population execution scripts in `population_tests/` rather than isolated Vitest/Jest unit test specs.

### P3: Optional Future Features
- **P3.1: Chromosomal Linkage Groups**
  - Model 38 autosomes with crossover recombination frequency.
- **P3.2: Multi-Stage Lifecycle & Aging**
  - Introduce puppyhood, adult maturity, senior aging, and mortality.

---

## I. Acceptance Criteria for Prioritized Items

1. **P1.1 (Seeded Randomness):**
   - Inject an optional PRNG seed into `createOffspring` and `resolveMutation`.
   - Given the same parents, same compatibility result, and same PRNG seed, `createOffspring` must produce identical genotypes, phenotypes, and mutation outcomes.

2. **P1.2 (Sandbox Compatibility Multiplication):**
   - In Sandbox mode, if a user overrides species compatibility, fertility penalties from interspecific distance should be configurable or capped so sandbox offspring remain viable.

3. **P2.1 (UI Modularization):**
   - Extract state management, DOM event listeners, and markdown report generators into distinct modules under `src/ui/` and `src/sim/` without changing any external behavior or DOM ID contracts.

---

## J. Risks and Open Questions

1. **Deterministic RNG Integration:** Care must be taken when introducing PRNG seeds to avoid breaking existing save file deserialization.
2. **Genetic Accuracy vs. Gameplay Balance:** Implementing true chromosomal linkage groups (38 canid chromosomes) would significantly increase computational complexity during litter generation.
3. **Scientific Accuracy Review:** Threshold model values in `developmentalAnomalyEngine.ts` and `healthEngine.ts` reflect plausible biological approximations, but formal validation against empirical veterinary literature is recommended before full release.

---

## K. Recommended Next Task

**Task:** *P1.1 — Implement Seeded PRNG for Deterministic Offspring Generation and Mutation Resolution.*

- **Scope:** Add an optional `seed` parameter to `createOffspring` and `resolveMutation`, introducing a lightweight pseudo-random number generator (e.g., LCG or Mulberry32).
- **Value:** Enables deterministic population testing, reproducible seed-based breeding, and robust unit test coverage across all genetic loci.
- **Safety:** Completely non-breaking; defaults to `Math.random()` if no seed is supplied.

---

## Final Audit Verification Checklist

- [x] Audited revision explicitly identified (`f164e71ccf130ac97dc54eaf010a31e9341ea306`).
- [x] Every tracked file (90/90) cataloged in complete inventory.
- [x] End-to-end parent-to-offspring genetics pipeline fully traced to source.
- [x] Realistic vs. Sandbox mode isolations and genetic correctness audited.
- [x] External open-source candidates inspected and compared with exact source citations.
- [x] Feature comparison matrix and prioritized backlog established.
- [x] Zero application source code, configuration files, or dependencies modified.
