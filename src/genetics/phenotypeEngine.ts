import type { Genotype, TraitValue } from "../types/animal";

function hasAllele(genotype: Genotype, locus: string, allele: string): boolean {
  const pair = genotype.loci[locus];

  if (!pair) {
    return false;
  }

  return pair.maternal === allele || pair.paternal === allele;
}

function isHomozygous(genotype: Genotype, locus: string, allele: string): boolean {
  const pair = genotype.loci[locus];

  if (!pair) {
    return false;
  }

  return pair.maternal === allele && pair.paternal === allele;
}

function dominantAllele(genotype: Genotype, locus: string): string | null {
  const pair = genotype.loci[locus];

  if (!pair) {
    return null;
  }

  return pair.maternal;
}

export function evaluatePhenotypeFromGenotype(
  genotype: Genotype,
  basePhenotype: Record<string, TraitValue>
): Record<string, TraitValue> {
  const phenotype: Record<string, TraitValue> = {
    ...basePhenotype,
  };

  if (isHomozygous(genotype, "coat_extension_locus", "e")) {
    phenotype.trait_base_coat_color = "cream";
  } else {
    const coatAllele = dominantAllele(genotype, "coat_base_locus");

    if (coatAllele === "white_carrier" && Math.random() < 0.35) {
      phenotype.trait_base_coat_color = "white";
    } else if (coatAllele === "black_carrier" && Math.random() < 0.35) {
      phenotype.trait_base_coat_color = "black";
    } else if (coatAllele) {
      phenotype.trait_base_coat_color = coatAllele;
    }
  }

  if (hasAllele(genotype, "coat_pattern_locus", "piebald")) {
    phenotype.trait_coat_pattern = "piebald";
  }

  if (hasAllele(genotype, "coat_pattern_locus", "masked")) {
    phenotype.trait_coat_pattern = "masked";
  }

  if (hasAllele(genotype, "ear_carriage_locus", "floppy")) {
    phenotype.trait_ear_type = "semi_erect";
  }

  if (isHomozygous(genotype, "ear_carriage_locus", "floppy")) {
    phenotype.trait_ear_type = "floppy";
  }

  if (hasAllele(genotype, "ear_carriage_locus", "erect_large")) {
    phenotype.trait_ear_type = "erect_large";
  }

  if (hasAllele(genotype, "tail_carriage_locus", "bobtail")) {
    phenotype.trait_tail_type = "bobtail";
  }

  if (hasAllele(genotype, "tail_carriage_locus", "bushy_short")) {
    phenotype.trait_tail_type = "bushy_short";
  }

  const bodySize = dominantAllele(genotype, "body_size_locus");

  if (bodySize === "tiny") phenotype.trait_body_size = 0.18;
  if (bodySize === "small") phenotype.trait_body_size = 0.3;
  if (bodySize === "medium_small") phenotype.trait_body_size = 0.45;
  if (bodySize === "medium") phenotype.trait_body_size = 0.6;
  if (bodySize === "large") phenotype.trait_body_size = 0.85;
  if (bodySize === "giant") phenotype.trait_body_size = 0.95;

  const temperament = dominantAllele(genotype, "temperament_locus");

  if (temperament === "domestic_social") {
    phenotype.trait_temperament = Math.max(
      Number(phenotype.trait_temperament ?? 0.5),
      0.8
    );
    phenotype.trait_trainability = Math.max(
      Number(phenotype.trait_trainability ?? 0.4),
      0.85
    );
  }

  if (temperament === "ancient_predator") {
    phenotype.trait_prey_drive = Math.max(
      Number(phenotype.trait_prey_drive ?? 0.7),
      0.95
    );
    phenotype.trait_trainability = Math.min(
      Number(phenotype.trait_trainability ?? 0.4),
      0.2
    );
  }

  if (hasAllele(genotype, "domestication_locus", "domesticated")) {
    phenotype.trait_domestication_score = 0.85;
  } else {
    phenotype.trait_domestication_score = Number(
      phenotype.trait_domestication_score ?? 0.05
    );
  }

  return phenotype;
}