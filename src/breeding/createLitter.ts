import type { Animal } from "../types/animal";
import type { CompatibilityResult } from "./resolveCompatibility";
import { createOffspring } from "./createOffspring";
import { calculateInbreeding } from "../genetics/calculateInbreeding";

function getLitterPotential(animal: Animal): number {
  const rawValue = Number(animal.phenotype?.trait_litter_size_potential ?? 5);

  if (Number.isNaN(rawValue)) {
    return 5;
  }

  return Math.max(1, Math.min(12, rawValue));
}

function calculateLitterSize(
  parentA: Animal,
  parentB: Animal,
  compatibility: CompatibilityResult,
  inbreedingFertilityMultiplier: number
): number {
  const litterTraitA = getLitterPotential(parentA);
  const litterTraitB = getLitterPotential(parentB);

  const averageLitterPotential = (litterTraitA + litterTraitB) / 2;
  const averageFertility = (parentA.stats.fertility + parentB.stats.fertility) / 2;

  const compatibilityFactor = compatibility.compatibility;
  const sterilityFactor = 1 - compatibility.sterilityChance;

  const biologicalBase =
    averageLitterPotential *
    averageFertility *
    sterilityFactor *
    inbreedingFertilityMultiplier;

  const compatibilityPenalty =
    0.55 + compatibilityFactor * 0.65;

  const projectedSize =
    biologicalBase * compatibilityPenalty;

  const randomVariance =
    Math.floor(Math.random() * 4) - 1;

  return Math.max(
    1,
    Math.min(
      12,
      Math.round(projectedSize + randomVariance)
    )
  );
}

export function createLitter(
  parentA: Animal,
  parentB: Animal,
  compatibility: CompatibilityResult,
  mutationData: any,
  animals: Animal[],
  phenotypeRulesData: any
): Animal[] {
  const inbreedingResult = calculateInbreeding(parentA, parentB, animals);

  const litterSize = calculateLitterSize(
    parentA,
    parentB,
    compatibility,
    inbreedingResult.fertilityMultiplier
  );

  const litter: Animal[] = [];

  for (let i = 0; i < litterSize; i++) {
    litter.push(
      createOffspring(
        parentA,
        parentB,
        compatibility,
        mutationData,
        inbreedingResult,
        phenotypeRulesData
      )
    );
  }

  return litter;
}