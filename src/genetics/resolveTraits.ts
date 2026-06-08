import type { Animal, TraitValue } from "../types/animal";

export interface TraitInheritanceResult {
  phenotype: Record<string, TraitValue>;
  dominantTraits: string[];
  recessiveCarriers: string[];
}

const TRAIT_BOUNDS: Record<string, { min: number; max: number }> = {
  trait_body_size: { min: 0.1, max: 1 },
  trait_leg_length: { min: 0.4, max: 1 },
  trait_skull_robustness: { min: 0.1, max: 1 },
  trait_muzzle_length: { min: 0.1, max: 1 },
  trait_body_mass_modifier: { min: 0.5, max: 2 },

  trait_temperament: { min: 0, max: 1 },
  trait_prey_drive: { min: 0, max: 1 },
  trait_pack_bonding: { min: 0, max: 1 },
  trait_trainability: { min: 0, max: 1 },

  trait_immune_vigor: { min: 0, max: 1 },
  trait_lifespan_potential: { min: 0.2, max: 1 },
  trait_inbreeding_coefficient: { min: 0, max: 1 },
  trait_genetic_stability: { min: 0, max: 1 },

  trait_fertility_rate: { min: 0, max: 1 },
  trait_litter_size_potential: { min: 1, max: 12 },
  trait_sterility_risk: { min: 0, max: 1 },

  trait_mutation_rate: { min: 0, max: 1 },
  trait_dna_completeness: { min: 0, max: 1 },
};

function isNumber(value: TraitValue | undefined): value is number {
  return typeof value === "number";
}

function isStringArray(value: TraitValue | undefined): value is string[] {
  return Array.isArray(value);
}

function clampTraitValue(traitId: string, value: number): number {
  const bounds = TRAIT_BOUNDS[traitId] ?? { min: 0, max: 1 };
  return Math.max(bounds.min, Math.min(bounds.max, value));
}

function roundTraitValue(value: number): number {
  return Math.round(value * 100) / 100;
}

function blendNumeric(traitId: string, a: number, b: number): number {
  const average = (a + b) / 2;

  const bounds = TRAIT_BOUNDS[traitId] ?? { min: 0, max: 1 };
  const range = bounds.max - bounds.min;

  const variance = (Math.random() - 0.5) * range * 0.08;
  const blended = average + variance;

  return roundTraitValue(clampTraitValue(traitId, blended));
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
  traitId: string,
  rawValue: string,
  existingValue: TraitValue | undefined
): TraitValue {
  if (existingValue === undefined) {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;

    const numericValue = Number(rawValue);
    if (!Number.isNaN(numericValue)) {
      return roundTraitValue(clampTraitValue(traitId, numericValue));
    }

    return rawValue;
  }

  if (typeof existingValue === "boolean") {
    return rawValue === "true";
  }

  if (typeof existingValue === "number") {
    const numericValue = Number(rawValue);
    return Number.isNaN(numericValue)
      ? existingValue
      : roundTraitValue(clampTraitValue(traitId, numericValue));
  }

  if (Array.isArray(existingValue)) {
    return Array.from(new Set([...existingValue, rawValue]));
  }

  return rawValue;
}

function inheritSingleCarrier(): boolean {
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
      phenotype[traitId] = blendNumeric(traitId, valueA, valueB);
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
        parsed.traitId,
        parsed.value,
        phenotype[parsed.traitId]
      );

      recessiveCarriers.push(carrier);
      continue;
    }

    if (inheritSingleCarrier()) {
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