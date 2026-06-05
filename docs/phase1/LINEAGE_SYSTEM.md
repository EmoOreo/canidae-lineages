# Lineage System Design

## Storage format
Lineage is a percentage-based ancestry ledger stored in the `L` layer of the genome. Every lineage entry uses a canonical lineage ID and a percentage value.

Example storage:
- `canis_lupus`: 50
- `aenocyon_dirus`: 25
- `canis_latrans`: 25

Guidelines:
- Percentages must total 100.
- Use stable lineage IDs, not display names.
- Preserve extinct ancestry even when present at low percentages.
- Treat lineage as a persistent record that can be inspected by the UI, AI, and encyclopedia.

## Inheritance rules
Lineage is inherited by weighted averaging of both parents, then normalized.

Recommended method:
1. Start with each parent's lineage percentages.
2. Multiply each entry by 0.5.
3. Merge matching IDs.
4. Normalize to 100.
5. Apply mutation or reconstruction adjustments only after normalization.

If one parent has a lineage not present in the other, the lineage persists at reduced strength rather than disappearing immediately.

## Ancestry blending
Blending should favor the more recent and more genetically stable ancestry while still preserving historical composition.

Examples:
- 100% Gray Wolf x 100% Coyote -> offspring can begin around 50/50.
- 75% Wolf x 25% Coyote paired with 100% Wolf -> offspring trend toward 87.5% Wolf, 12.5% Coyote.
- Extinct ancestry is blended normally, but reconstruction penalties reduce stability.

## Lineage decay across generations
Lineage should not decay to zero automatically. Instead, low-percentage ancestry becomes harder to express phenotypically while remaining archived.

Suggested decay rule:
- If ancestry is below 5%, it becomes archive-only for phenotype influence unless reinforced.
- 5% to 24%: low expression influence.
- 25% to 49%: moderate influence.
- 50%+: dominant lineage influence.

This supports long-term hybrid tracking without losing ancestry history.

## Classification thresholds
Use lineage percentages to classify the animal for display, encyclopedia, and breeding UI.

Threshold suggestions:
- 95%+: primary species classification.
- 70%+: primary lineage with minor admixture.
- 50%-69%: hybrid primary lineage.
- 25%-49%: mixed lineage.
- below 25%: trace ancestry.

These thresholds should be used for labels, not hard biological restrictions.

## Species naming rules
If one lineage reaches 95% or more and the phenotype matches, use the dominant species name.
If no lineage reaches 95%, prefer a hybrid or lineage composite name.
If extinct ancestry is present above 50%, the name should reference revival status where appropriate.

Examples:
- 96% Gray Wolf -> Gray Wolf
- 75% Wolf, 25% Coyote -> Wolf-Coyote Hybrid
- 60% Dire Wolf, 40% Gray Wolf -> Dire Wolf Revival Line

## Hybrid naming rules
Hybrid names should be deterministic, searchable, and player-friendly.

Rule order:
1. Known historical hybrid names if available.
2. Portmanteau based on major lineages.
3. Experimental prefix for distant crosses.
4. Revival or ancient prefix for extinct lineages.

Examples:
- Wolfdog
- Coywolf
- EXP-CanVul Gen1
- REVIVAL-DireWolf Gen2
- ANCIENT-Bor+Wolf Gen1

## Archive classification rules
Archive classification is used for encyclopedia, achievements, and lineage history.

Archive tags:
- `primary`
- `secondary`
- `trace`
- `relic`
- `revival`
- `ancient`

Rules:
- `relic` applies to extinct ancestry below 25%.
- `revival` applies when extinct ancestry is actively being reconstructed.
- `ancient` applies to Borophaginae and other deep extinct branches.

## Influence on appearance
Lineage affects appearance through weighted trait inheritance.
- Gray wolf ancestry pushes size, muzzle length, bushy tail, and agouti coat.
- Coyote ancestry tends toward medium size, slender muzzle, and tawny coat.
- Fox ancestry reduces overall size and increases ear-to-head ratio.
- Dire wolf ancestry increases robustness and skull mass.
- Borophagus ancestry increases skull crushing shape and compact power features.

## Influence on body size
Body size should be one of the strongest lineage-linked traits.
- Large canid ancestry increases body mass and shoulder height.
- Fox ancestry sharply reduces size.
- Ancient lineages may reintroduce extreme size or robustness modifiers.

## Influence on temperament
Temperament should reflect both lineage and domestication history.
- Domestic dog ancestry increases trainability and social tolerance.
- Wolf ancestry increases caution and prey drive.
- Fox ancestry increases skittishness and solitary behavior.
- Wild dog ancestry increases pack bonding and chase drive.

## Influence on fertility
Lineage affects fertility by taxonomic distance.
- Same-genus lineages remain the most fertile.
- Distant extinct lineages reduce fertility.
- Ancient and sandbox hybrids may produce fertile offspring only rarely.
- Hybrid vigor can offset some fertility loss, but only in close crosses.

## Influence on stability
Stability drops as lineage distance increases.
- Same genus: generally stable.
- Same tribe, different genus: unstable.
- Different tribe: highly unstable.
- Extinct reconstruction: stability depends on DNA completeness.
- Ancient branches: very high instability unless the system is specifically tuned.

## Influence on unlocks
Lineage can unlock:
- encyclopedia pages,
- special breeding events,
- extinct reconstruction research,
- rare coat mutations,
- achievement trees,
- lineage-specific cosmetic options.

## Influence on achievements
Examples:
- 100% historical reconstruction.
- Successful multi-generation hybrid stabilization.
- Revival of extinct canid lineages.
- Discovery of trace ancient ancestry after repeated breeding.

## Influence on encyclopedia entries
The encyclopedia should show:
- ancestry breakdown,
- generation count,
- known hybrid lineage label,
- stability score,
- fertility score,
- unlock history,
- extinct ancestry notes.

## Examples

### Example 1: Simple hybrid
Parent A: 100% Gray Wolf
Parent B: 100% Coyote
Offspring result:
- 50% Gray Wolf
- 50% Coyote
Label: Coywolf or Wolf-Coyote Hybrid

### Example 2: Backcrossing
Offspring above x 100% Gray Wolf
Result:
- 75% Gray Wolf
- 25% Coyote
Label: Wolf-dominant Hybrid

### Example 3: Extinct ancestry
Parent A: 80% Gray Wolf, 20% Dire Wolf
Parent B: 100% Gray Wolf
Offspring result:
- 90% Gray Wolf
- 10% Dire Wolf
Label: Wolf with Dire Wolf trace ancestry

### Example 4: Ancient sandbox cross
Parent A: Borophagus
Parent B: Gray Wolf
Offspring result:
- Mixed ancient/extant lineage
- Archive classification: ancient
- Stability: very low
- Fertility: near zero