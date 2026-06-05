import type { Animal, TraitValue } from "../types/animal";

function isNumber(value: TraitValue | undefined): value is number {
  return typeof value === "number";
}

function isStringArray(value: TraitValue | undefined): value is string[] {
  return Array.isArray(value);
}

function blendNumeric(a: number, b: number): number {
  const average = (a + b) / 2;
  const variance = (Math.random() - 0.5) * 0.08;
  return Math.round(Math.max(0, Math.min(1, average + variance)) * 100) / 100;
}

function chooseCategorical(a: TraitValue | undefined, b: TraitValue | undefined): TraitValue {
  if (a === undefined) return b ?? "";
  if (b === undefined) return a;
  if (a === b) return a;

  return Math.random() < 0.5 ? a : b;
}

function unionSets(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

export function resolveTraits(
  parentA: Animal,
  parentB: Animal
): Record<string, TraitValue> {
  const phenotype: Record<string, TraitValue> = {};

  const traitIds = new Set([
    ...Object.keys(parentA.phenotype),
    ...Object.keys(parentB.phenotype),
  ]);

  for (const traitId of traitIds) {
    const valueA = parentA.phenotype[traitId];
    const valueB = parentB.phenotype[traitId];

    if (isNumber(valueA) && isNumber(valueB)) {
      phenotype[traitId] = blendNumeric(valueA, valueB);
      continue;
    }

    if (isStringArray(valueA) && isStringArray(valueB)) {
      phenotype[traitId] = unionSets(valueA, valueB);
      continue;
    }

    phenotype[traitId] = chooseCategorical(valueA, valueB);
  }

  return phenotype;
}