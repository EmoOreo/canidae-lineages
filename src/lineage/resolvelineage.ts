import type { Animal } from "../types/animal";

export function resolveLineage(
  parentA: Animal,
  parentB: Animal
): Record<string, number> {
  const lineage: Record<string, number> = {};

  const addLineage = (
    source: Record<string, number>,
    weight: number
  ) => {
    for (const [speciesId, percent] of Object.entries(source)) {
      lineage[speciesId] =
        (lineage[speciesId] ?? 0) + percent * weight;
    }
  };

  addLineage(parentA.genome.L, 0.5);
  addLineage(parentB.genome.L, 0.5);

  const total = Object.values(lineage)
    .reduce((sum, value) => sum + value, 0);

  for (const key of Object.keys(lineage)) {
    lineage[key] =
      Math.round((lineage[key] / total) * 10000) / 100;
  }

  return lineage;
}