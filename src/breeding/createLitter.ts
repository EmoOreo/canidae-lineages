import type { Animal } from "../types/animal";
import type { CompatibilityResult } from "./resolveCompatibility";
import { createOffspring } from "./createOffspring";

export function createLitter(
  parentA: Animal,
  parentB: Animal,
  compatibility: CompatibilityResult,
  mutationData: any
): Animal[] {
  const litterTraitA =
    Number(parentA.phenotype?.trait_litter_size_potential ?? 4);

  const litterTraitB =
    Number(parentB.phenotype?.trait_litter_size_potential ?? 4);

  const averageLitterSize =
    (litterTraitA + litterTraitB) / 2;

  const fertilityFactor =
    ((parentA.stats.fertility + parentB.stats.fertility) / 2);

  const compatibilityFactor =
    compatibility.compatibility;

  const projectedSize =
    averageLitterSize *
    fertilityFactor *
    (0.5 + compatibilityFactor);

  const litterSize = Math.max(
    1,
    Math.min(
      12,
      Math.round(projectedSize + (Math.random() * 2 - 1))
    )
  );

  const litter: Animal[] = [];

  for (let i = 0; i < litterSize; i++) {
    litter.push(
      createOffspring(
        parentA,
        parentB,
        compatibility,
        mutationData
      )
    );
  }

  return litter;
}