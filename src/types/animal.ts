export type TraitValue = string | number | boolean | string[];

export interface AllelePair {
  maternal: string;
  paternal: string;
}

export interface Genotype {
  loci: Record<string, AllelePair>;
  inheritedMutations: string[];
}

export interface AncestrySnapshot {
  parentIds: string[];
  founderIds: string[];
  lineage: Record<string, number>;
}

export interface Animal {
  id: string;
  name: string;
  speciesId: string;
  generation: number;

  motherId: string | null;
  fatherId: string | null;
  motherName: string | null;
  fatherName: string | null;

  inbreedingCoefficient: number;
  inbreedingTier: "none" | "low" | "moderate" | "high" | "severe";

  genotype: Genotype;
  phenotype: Record<string, TraitValue>;
  ancestry: AncestrySnapshot;

  genome: {
    D: string[];
    R: string[];
    M: string[];
    L: Record<string, number>;
  };

  stats: {
    fertility: number;
    stability: number;
  };
}