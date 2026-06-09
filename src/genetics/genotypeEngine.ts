import type { Animal, Genotype, AllelePair } from "../types/animal";
import { normalizeCarriers } from "./normalizeCarriers";

type RawAllelePair = [string, string];

interface SpeciesGenotypesData {
  defaultGenotype?: Record<string, RawAllelePair>;
  founderGenotypes?: Record<string, Record<string, RawAllelePair>>;
}

function chooseAllele(pair: AllelePair): string {
  return Math.random() < 0.5 ? pair.maternal : pair.paternal;
}

function makePair(maternal: string, paternal: string): AllelePair {
  return {
    maternal,
    paternal,
  };
}

function normalizeRawPair(rawPair: RawAllelePair | undefined): AllelePair | null {
  if (!rawPair || rawPair.length < 2) {
    return null;
  }

  return makePair(rawPair[0], rawPair[1]);
}

export function createFounderGenotype(
  species: any,
  speciesGenotypesData: SpeciesGenotypesData
): Genotype {
  const defaultGenotype = speciesGenotypesData.defaultGenotype ?? {};
  const speciesGenotype =
    speciesGenotypesData.founderGenotypes?.[species.id] ?? {};

  const locusNames = new Set([
    ...Object.keys(defaultGenotype),
    ...Object.keys(speciesGenotype),
  ]);

  const loci: Record<string, AllelePair> = {};

  for (const locusName of locusNames) {
    const rawPair = speciesGenotype[locusName] ?? defaultGenotype[locusName];
    const pair = normalizeRawPair(rawPair);

    if (pair) {
      loci[locusName] = pair;
    }
  }

  return {
    loci,
    inheritedMutations: [],
  };
}

export function inheritGenotype(parentA: Animal, parentB: Animal): Genotype {
  const loci: Record<string, AllelePair> = {};

  const locusNames = new Set([
    ...Object.keys(parentA.genotype?.loci ?? {}),
    ...Object.keys(parentB.genotype?.loci ?? {}),
  ]);

  for (const locusName of locusNames) {
    const locusA = parentA.genotype?.loci?.[locusName];
    const locusB = parentB.genotype?.loci?.[locusName];

    if (locusA && locusB) {
      loci[locusName] = {
        maternal: chooseAllele(locusA),
        paternal: chooseAllele(locusB),
      };
      continue;
    }

    if (locusA) {
      const allele = chooseAllele(locusA);
      loci[locusName] = {
        maternal: allele,
        paternal: allele,
      };
      continue;
    }

    if (locusB) {
      const allele = chooseAllele(locusB);
      loci[locusName] = {
        maternal: allele,
        paternal: allele,
      };
    }
  }

  return {
    loci,
    inheritedMutations: Array.from(
      new Set([
        ...(parentA.genotype?.inheritedMutations ?? []),
        ...(parentB.genotype?.inheritedMutations ?? []),
        ...(parentA.genome?.M ?? []),
        ...(parentB.genome?.M ?? []),
      ])
    ),
  };
}

export function getRecessiveCarriersFromGenotype(genotype: Genotype): string[] {
  const carriers: string[] = [];

  for (const [locusName, pair] of Object.entries(genotype.loci)) {
    if (pair.maternal !== pair.paternal) {
      carriers.push(`${locusName}:${pair.maternal}/${pair.paternal}`);
    }
  }

  return normalizeCarriers(carriers);
}