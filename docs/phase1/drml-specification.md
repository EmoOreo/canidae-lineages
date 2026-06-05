# DRML Specification

## 1. Genome structure
The breeding engine uses a four-layer genome model: **D**ominant expressed traits, **R**ecessive hidden traits, **M**utation traits, and **L**ineage ancestry percentages. Each animal has one immutable genome record and one phenotype record derived from it.

Recommended storage layout:
- `D`: map of expressed trait IDs to active values.
- `R`: map of hidden carrier alleles to trait IDs and values.
- `M`: list of active mutation entries, each with trait impact and persistence.
- `L`: list of ancestry entries with species IDs and percentages that always total 100.

A genome is not the same as a phenotype. The genome is the source-of-truth; phenotype is the rendered result after all ordering, conflicts, and modifiers are applied.

## 2. Gene slot structure
Each trait is stored in a gene slot with these fields:
- `trait_id`
- `allele_type` (`D`, `R`, `M`, or `L`)
- `value`
- `source_parent`
- `generation_inherited`
- `stability_weight`
- `dominance_rank`
- `visibility`

Gene slots are grouped by trait family: morphology, coat, behavior, ecology, health, fertility, and lineage. A trait may have both a D and R representation at the same time; D is the visible expression and R is the hidden carrier state.

## 3. Dominant trait resolution
Dominant traits are resolved first among standard alleles. If one parent carries an expressed dominant version and the other does not, the dominant trait is inherited into D unless a higher-priority mutation overrides it.

Resolution order for a single trait:
1. Mutation override.
2. Dominant expressed trait inheritance.
3. Recessive carrier retention.
4. Lineage-weighted adjustment.
5. Stability clamp.

If both parents express different dominant values for the same trait, the child inherits the value with higher dominance rank. If ranks are equal, the phenotype uses a blend and both parents remain eligible for carrier storage in R.

## 4. Recessive carrier storage
Recessive traits are stored in `R` whenever they are not expressed but remain genetically present. A recessive trait can persist indefinitely through carrier chains without appearing in phenotype.

Carrier logic:
- If both parents supply the same recessive allele, the trait may move from `R` to `D`.
- If only one parent supplies it, store it in `R` with visibility `hidden`.
- Recessive storage is never lost unless overwritten by mutation, extinction reconstruction, or lineage purge rules.

Carrier state should preserve hidden variants for future breeding outcomes and encyclopedia tracking.

## 5. Mutation storage
Mutations are stored in `M` as discrete objects rather than as plain flags. Each mutation entry should include at least:
- mutation ID
- trait affected
- magnitude or categorical effect
- origin generation
- persistence flag
- reversibility flag
- whether it is cosmetic, structural, or functional

Mutation traits may affect phenotype directly and may also alter D or R values. Some mutations are permanent line-wide features; others are one-generation events.

## 6. Lineage storage
Lineage is stored in `L` as ancestry percentages with exact percentages summing to 100. Each entry should use a stable species or lineage ID, not a display name.

Example:
- `canis_lupus`: 50
- `aenocyon_dirus`: 25
- `canis_latrans`: 25

Lineage can also preserve a confidence field for extinct reconstruction systems if needed later, but Phase 1 only requires percentage composition.

## 7. Trait conflict resolution
When multiple sources affect the same trait, resolve conflicts in this priority order:
1. Mutation.
2. Direct dominant expression.
3. Recessive expression.
4. Lineage ancestry weighting.
5. Environmental modification.
6. Stability clamp.

Rules:
- Mutations override all non-mutation trait states unless flagged cosmetic-only.
- If D and M both affect the same trait, M wins if its priority is higher.
- If two parents supply incompatible categories, use the nearest permitted shared category or the ancestral fallback defined by the trait library.
- For numeric traits, use the weighted blend before applying penalties or clamps.

## 8. Mutation priority order
Mutation priority is determined by functional impact:
1. Lethal or severe structural mutations.
2. Fertility-affecting mutations.
3. Health-affecting mutations.
4. Morphology-affecting mutations.
5. Coat/color mutations.
6. Cosmetic-only mutations.

If two mutations target the same trait, the one with higher severity or later generation persistence wins. If they are equal, the newer mutation wins unless the older one is marked permanent.

## 9. Phenotype generation order
Generate phenotype in this exact order:
1. Assemble parental genome inputs.
2. Build lineage percentages in `L`.
3. Resolve inherited D traits.
4. Resolve hidden R carrier states.
5. Apply mutation entries from `M`.
6. Apply trait conflicts and dominance rules.
7. Apply lineage weighting adjustments.
8. Apply stability, fertility, and inbreeding modifiers.
9. Clamp results to legal bounds.
10. Emit phenotype for UI, AI, and breeding systems.

This order ensures mutation and lineage both influence the final result without destabilizing deterministic inheritance.

## 10. Stability calculations
Stability is a normalized value from 0.0 to 1.0.

Suggested calculation:
- Start with parental average.
- Add heterozygosity bonus when parents are genetically distant but still compatible.
- Subtract cross-tribe or cross-subfamily penalty.
- Subtract inbreeding penalty.
- Subtract extinct-reconstruction uncertainty.
- Clamp to 0.0-1.0.

Recommended formula:
`stability = clamp(base + ancestry_bonus - distance_penalty - inbreeding_penalty - reconstruction_penalty, 0, 1)`

Interpretation:
- 0.80-1.00: stable
- 0.50-0.79: workable
- 0.30-0.49: unstable
- below 0.30: critical instability

## 11. Fertility calculations
Fertility is also normalized from 0.0 to 1.0 and should be computed after stability.

Recommended formula:
`fertility = clamp(base_fertility * stability_multiplier * compatibility_multiplier * reconstruction_multiplier * inbreeding_multiplier, 0, 1)`

Notes:
- Base fertility comes from the compendium.
- Stability multiplier drops sharply below 0.50.
- Compatibility multiplier reflects taxonomic distance.
- Reconstruction multiplier applies to extinct DNA recovery.
- Inbreeding multiplier applies from pedigree analysis.

Very low fertility should not necessarily mean zero fertility; rare successful offspring preserve the possibility of challenge-driven gameplay.

## 12. Inbreeding calculations
Inbreeding is derived from shared ancestry within a configurable lookback window.

Recommended rules:
- 0 shared ancestors in lookback window: 0.00
- 1 close shared ancestor: mild inbreeding
- sibling/parent-child pairings: extreme inbreeding
- repeated linebreeding: cumulative inbreeding increase

Suggested outputs:
- `inbreeding_coefficient`
- `inbreeding_penalty`
- `health_risk`
- `fertility_risk`

Inbreeding should reduce fertility and stability, increase mutation risk, and increase disease susceptibility.

## 13. Generation calculations
Generation number should advance one step per reproductive event relative to the oldest parent lineage baseline.

Rules:
- Pure parents from same generation produce generation +1 offspring.
- Cross-generation pairings use the higher generation parent as the base reference.
- Hybrid lines keep their own generation count after first successful birth.
- Extinct reconstruction lineages may use a generation tag even before full fertility unlocks.

Recommended formula:
`offspring_generation = max(parent_a_generation, parent_b_generation) + 1`

---

## Inheritance examples

### Example 1: Dominant / Recessive
Parent A:
- `D:large_body`

Parent B:
- `R:small_body`

Outcome:
- `D:large_body`
- `R:small_body`

If `large_body` and `small_body` conflict on the same trait, phenotype expresses `large_body` because D outranks R.

### Example 2: Recessive expression
Parent A:
- `R:blue_eyes`

Parent B:
- `R:blue_eyes`

Outcome:
- `D:blue_eyes`
- `R:blue_eyes`

### Example 3: Mutation override
Parent A:
- `D:black_coat`

Parent B:
- `D:black_coat`

Mutation:
- `M:leucism`

Outcome:
- phenotype coat becomes leucistic or mostly white depending on mutation severity.
- `D:black_coat` remains in genome unless mutation permanently rewrites the slot.

### Example 4: Lineage influence
Parent A:
- 50% Gray Wolf
- 50% Coyote

Parent B:
- 100% Gray Wolf

Offspring lineage example:
- 75% Gray Wolf
- 25% Coyote

## Edge cases
- If a trait has no valid inherited value, fall back to species baseline.
- If both parents carry conflicting mutations with equal severity, use the later generation mutation.
- If lineage percentages do not total 100, normalize before phenotype generation.
- If extinct DNA reconstruction is incomplete, cap stability and fertility regardless of other bonuses.

## Conflict examples

### Coat conflict
Parent A has `D:melanism`.
Parent B has `D:leucism`.
Outcome depends on mutation priority:
- If melanism is inherited and leucism is a mutation, leucism wins if its severity is higher.
- If both are standard mutations, use the dominant severity tier or a defined conflict table.

### Behavior conflict
Parent A has high prey drive.
Parent B has low prey drive.
Outcome:
- numeric blend with possible upward bias if either parent is a high-prey-drive lineage like wolf or wild dog.

### Hybrid conflict
Wolf x fox in sandbox mode:
- D traits resolve normally where possible.
- L stores ancestry percentages.
- M accumulates heavy instability flags.
- Fertility is usually near zero.

## Hybrid examples

### Wolfdog
- Lineage: Canis lupus + Canis familiaris
- Phenotype: wolf-dog blend with broad compatibility, usually fertile if within Canis group.

### Coywolf
- Lineage: wolf + coyote + dog admixture
- Phenotype: intermediate size, adaptable coat, elevated stamina.

### Dire wolf reconstruction hybrid
- Lineage: historical Aenocyon base + modern Canis recovery support
- Phenotype: heavy canid body plan with elevated instability and reconstruction penalties.

### Borophagus sandbox hybrid
- Lineage: ancient Borophaginae + extant canid support
- Phenotype: extreme instability, likely sterile, may express bone-crushing skull anomalies.