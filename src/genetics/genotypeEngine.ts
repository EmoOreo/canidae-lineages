import type { Animal, Genotype, AllelePair } from "../types/animal";

function chooseAllele(pair: AllelePair): string {
  return Math.random() < 0.5 ? pair.maternal : pair.paternal;
}

function makePair(maternal: string, paternal: string): AllelePair {
  return {
    maternal,
    paternal,
  };
}

export function createFounderGenotype(species: any): Genotype {
  const speciesId = species.id;

  const loci: Record<string, AllelePair> = {
    coat_base_locus: makePair("agouti", "agouti"),
    coat_extension_locus: makePair("E", "E"),
    coat_dilution_locus: makePair("D", "D"),
    coat_pattern_locus: makePair("solid", "solid"),
    ear_carriage_locus: makePair("erect", "erect"),
    tail_carriage_locus: makePair("normal", "normal"),
    body_size_locus: makePair("medium", "medium"),
    temperament_locus: makePair("wild_balanced", "wild_balanced"),
    domestication_locus: makePair("wildtype", "wildtype"),
  };

  if (speciesId === "canis_lupus_familiaris") {
    loci.coat_base_locus = makePair("agouti", "white_carrier");
    loci.coat_extension_locus = makePair("E", "e");
    loci.ear_carriage_locus = makePair("erect", "floppy");
    loci.tail_carriage_locus = makePair("normal", "bobtail");
    loci.body_size_locus = makePair("variable_large", "variable_small");
    loci.temperament_locus = makePair("domestic_social", "domestic_social");
    loci.domestication_locus = makePair("domesticated", "domesticated");
  }

  if (speciesId === "canis_lupus") {
    loci.coat_base_locus = makePair("agouti", "white_carrier");
    loci.coat_extension_locus = makePair("E", "E");
    loci.tail_carriage_locus = makePair("normal", "bushy_short");
    loci.body_size_locus = makePair("large", "large");
    loci.temperament_locus = makePair("pack_wild", "pack_wild");
  }

  if (speciesId === "canis_latrans") {
    loci.coat_base_locus = makePair("sandy", "agouti");
    loci.coat_pattern_locus = makePair("solid", "masked");
    loci.body_size_locus = makePair("medium_small", "medium_small");
    loci.temperament_locus = makePair("adaptable_wild", "adaptable_wild");
  }

  if (speciesId === "vulpes_vulpes") {
    loci.coat_base_locus = makePair("red_orange", "black_carrier");
    loci.coat_pattern_locus = makePair("solid", "piebald");
    loci.ear_carriage_locus = makePair("erect", "erect");
    loci.body_size_locus = makePair("small", "small");
    loci.temperament_locus = makePair("solitary_wild", "solitary_wild");
  }

  if (speciesId === "vulpes_zerda") {
    loci.coat_base_locus = makePair("cream", "cream");
    loci.ear_carriage_locus = makePair("erect_large", "erect_large");
    loci.body_size_locus = makePair("tiny", "tiny");
    loci.temperament_locus = makePair("desert_wild", "desert_wild");
  }

  if (speciesId === "aenocyon_dirus") {
    loci.coat_base_locus = makePair("gray", "red_orange");
    loci.body_size_locus = makePair("giant", "giant");
    loci.temperament_locus = makePair("ancient_predator", "ancient_predator");
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

  return carriers;
}