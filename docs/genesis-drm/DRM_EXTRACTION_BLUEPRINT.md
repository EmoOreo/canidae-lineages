# DRM_EXTRACTION_BLUEPRINT.md

## Immediate Targets

Move to DRM Core:
- calculateInbreeding.ts
- genotypeEngine.ts
- resolveTraits.ts
- resolveMutation.ts
- healthEngine.ts
- developmentalAnomalyEngine.ts
- reproductionEngine.ts
- createLitter.ts
- createOffspring.ts
- resolvelineage.ts
- calculatePopulationStats.ts

Convert to Adapter-Driven:
- resolveCompatibility.ts
- phenotypeEngine.ts
- createHybridName.ts

Move to Species Packs:
- breeding_rules_starter.json
- species trait definitions
- compatibility values
- reconstruction assumptions

Result:

DRM Core
+
Canidae Adapter
+
Future Felidae Adapter
+
Future Avian Adapter
=
Project Genesis genetics architecture
