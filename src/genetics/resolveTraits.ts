import type { Animal, TraitValue } from "../types/animal";

export interface TraitInheritanceResult {
  phenotype: Record<string, TraitValue>;
  dominantTraits: string[];
  recessiveCarriers: string[];
}

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

function chooseCategorical(
  a: TraitValue | undefined,
  b: TraitValue | undefined
): TraitValue {
  if (a === undefined) return b ?? "";
  if (b === undefined) return a;
  if (a === b) return a;

  return Math.random() < 0.5 ? a : b;
}

function unionSets(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

function parseCarrier(carrier: string): { traitId: string; value: string } | null {
  const separatorIndex = carrier.indexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  return {
    traitId: carrier.slice(0, separatorIndex),
    value: carrier.slice(separatorIndex + 1),
  };
}

function convertCarrierValue(
  rawValue: string,
  existingValue: TraitValue | undefined
): TraitValue {
  if (existingValue === undefined) {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;

    const numericValue = Number(rawValue);
    if (!Number.isNaN(numericValue)) return numericValue;

    return rawValue;
  }

  if (typeof existingValue === "boolean") {
    return rawValue === "true";
  }

  if (typeof existingValue === "number") {
    const numericValue = Number(rawValue);
    return Number.isNaN(numericValue) ? existingValue : numericValue;
  }

  if (Array.isArray(existingValue)) {
    return Array.from(new Set([...existingValue, rawValue]));
  }

  return rawValue;
}

function inheritSingleCarrier(carrier: string): boolean {
  return Math.random() < 0.5;
}

export function resolveTraits(
  parentA: Animal,
  parentB: Animal
): TraitInheritanceResult {
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

  const parentCarriers = [...parentA.genome.R, ...parentB.genome.R];
  const carrierCounts = new Map<string, number>();

  for (const carrier of parentCarriers) {
    carrierCounts.set(carrier, (carrierCounts.get(carrier) ?? 0) + 1);
  }

  const recessiveCarriers: string[] = [];

  for (const [carrier, count] of carrierCounts.entries()) {
    const parsed = parseCarrier(carrier);

    if (!parsed) {
      continue;
    }

    if (count >= 2) {
      phenotype[parsed.traitId] = convertCarrierValue(
        parsed.value,
        phenotype[parsed.traitId]
      );

      recessiveCarriers.push(carrier);
      continue;
    }

    if (inheritSingleCarrier(carrier)) {
      recessiveCarriers.push(carrier);
    }
  }

  const dominantTraits = Object.keys(phenotype);

  return {
    phenotype,
    dominantTraits,
    recessiveCarriers: Array.from(new Set(recessiveCarriers)),
  };
}