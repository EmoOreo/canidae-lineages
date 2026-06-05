import type { Animal } from "../types/animal";

export interface CompatibilityResult {
  tier: number;
  label: string;
  realisticAllowed: boolean;
  sandboxAllowed: boolean;
  compatibility: number;
  sterilityChance: number;
  mutationModifier: number;
  notes: string;
}

function getPrimaryLineage(animal: Animal): string {
  return Object.entries(animal.genome.L).sort((a, b) => b[1] - a[1])[0][0];
}

function getSpeciesTemplate(speciesData: any, speciesId: string) {
  return speciesData.canids.find((canid: any) => canid.id === speciesId);
}

export function resolveCompatibility(
  parentA: Animal,
  parentB: Animal,
  speciesData: any
): CompatibilityResult {
  const lineageA = getPrimaryLineage(parentA);
  const lineageB = getPrimaryLineage(parentB);

  const speciesA = getSpeciesTemplate(speciesData, lineageA);
  const speciesB = getSpeciesTemplate(speciesData, lineageB);

  if (!speciesA || !speciesB) {
    return {
      tier: 99,
      label: "unknown",
      realisticAllowed: false,
      sandboxAllowed: true,
      compatibility: 0.1,
      sterilityChance: 0.9,
      mutationModifier: 3,
      notes: "Unknown species data; sandbox fallback only.",
    };
  }

  const taxA = speciesA.taxonomy;
  const taxB = speciesB.taxonomy;

  if (speciesA.id === speciesB.id) {
    return {
      tier: 1,
      label: "same_species_or_subspecies",
      realisticAllowed: true,
      sandboxAllowed: true,
      compatibility: 1,
      sterilityChance: 0,
      mutationModifier: 1,
      notes: "Highly compatible same species/subspecies pairing.",
    };
  }

  if (taxA.genus === taxB.genus) {
    return {
      tier: 3,
      label: "same_genus",
      realisticAllowed: true,
      sandboxAllowed: true,
      compatibility: 0.75,
      sterilityChance: 0.05,
      mutationModifier: 1.25,
      notes: "Plausible close-genus hybrid pairing.",
    };
  }

  if (taxA.tribe === taxB.tribe) {
    return {
      tier: 4,
      label: "same_tribe_different_genus",
      realisticAllowed: false,
      sandboxAllowed: true,
      compatibility: 0.45,
      sterilityChance: 0.35,
      mutationModifier: 1.75,
      notes: "Blocked in Realistic Mode; unstable but allowed in Sandbox Mode.",
    };
  }

  if (taxA.subfamily === taxB.subfamily) {
    return {
      tier: 5,
      label: "same_subfamily_different_tribe",
      realisticAllowed: false,
      sandboxAllowed: true,
      compatibility: 0.25,
      sterilityChance: 0.7,
      mutationModifier: 2.5,
      notes: "Very distant canid pairing; sandbox-only with severe penalties.",
    };
  }

  return {
    tier: 7,
    label: "deep_extinct_or_unknown_distance",
    realisticAllowed: false,
    sandboxAllowed: true,
    compatibility: 0.05,
    sterilityChance: 0.9,
    mutationModifier: 4,
    notes: "Extreme sandbox-only pairing.",
  };
}