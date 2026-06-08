import type { Animal } from "../types/animal";
import type { CompatibilityResult } from "./resolveCompatibility";
import { resolveLineage } from "../lineage/resolveLineage";
import { resolveMutation } from "../genetics/resolveMutation";
import { resolveTraits } from "../genetics/resolveTraits";
import { createHybridName } from "./createHybridName";
import type { InbreedingResult } from "../genetics/calculateInbreeding";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function createOffspring(
  parentA: Animal,
  parentB: Animal,
  compatibility: CompatibilityResult,
  mutationData: any,
  inbreedingResult: InbreedingResult
): Animal {
  const lineage = resolveLineage(parentA, parentB);
  const traitResult = resolveTraits(parentA, parentB);

  const generation = Math.max(parentA.generation, parentB.generation) + 1;

  const averageFertility =
    (parentA.stats.fertility + parentB.stats.fertility) / 2;

  const averageStability =
    (parentA.stats.stability + parentB.stats.stability) / 2;

  const fertility = round(
    averageFertility *
      compatibility.compatibility *
      (1 - compatibility.sterilityChance) *
      inbreedingResult.fertilityMultiplier
  );

  const stability = round(
    averageStability *
      compatibility.compatibility *
      inbreedingResult.stabilityMultiplier
  );

  const mutation = resolveMutation(
    compatibility.compatibility,
    compatibility.mutationModifier,
    mutationData
  );

  const hybridName = createHybridName(parentA, parentB);

  return {
    id: `offspring_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name: `${hybridName} G${generation}`,
    speciesId: "hybrid",
    generation,

    motherId: parentA.id,
    fatherId: parentB.id,
    motherName: parentA.name,
    fatherName: parentB.name,

    inbreedingCoefficient: inbreedingResult.coefficient,
    inbreedingTier: inbreedingResult.tier,

    genome: {
      D: traitResult.dominantTraits,
      R: traitResult.recessiveCarriers,
      M: mutation.mutationApplied ? [mutation.mutationId!] : [],
      L: lineage,
    },

    phenotype: {
      ...traitResult.phenotype,
      trait_inbreeding_coefficient: inbreedingResult.coefficient,
    },

    stats: {
      fertility,
      stability,
    },
  };
}