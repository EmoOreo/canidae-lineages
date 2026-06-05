import type { Animal } from "../types/animal";
import type { CompatibilityResult } from "./resolveCompatibility";
import { resolveLineage } from "../lineage/resolveLineage";
import { resolveMutation } from "../genetics/resolveMutation";

export function createOffspring(
  parentA: Animal,
  parentB: Animal,
  compatibility: CompatibilityResult,
  mutationData: any
): Animal {
  const lineage = resolveLineage(parentA, parentB);

  const generation = Math.max(parentA.generation, parentB.generation) + 1;

  const averageFertility =
    (parentA.stats.fertility + parentB.stats.fertility) / 2;

  const averageStability =
    (parentA.stats.stability + parentB.stats.stability) / 2;

  const fertility =
    Math.round(
      averageFertility *
        compatibility.compatibility *
        (1 - compatibility.sterilityChance) *
        100
    ) / 100;

  const stability =
    Math.round(averageStability * compatibility.compatibility * 100) / 100;

  const mutation = resolveMutation(
    compatibility.compatibility,
    compatibility.mutationModifier,
    mutationData
  );

  return {
    id: `offspring_${Date.now()}`,
    name: `${compatibility.label} G${generation}`,
    speciesId: "hybrid",
    generation,

    genome: {
      D: [],
      R: [],
      M: mutation.mutationApplied ? [mutation.mutationId!] : [],
      L: lineage,
    },

    phenotype: {},

    stats: {
      fertility,
      stability,
    },
  };
}