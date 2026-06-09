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
  ancestorIds: string[];
  lineage: Record<string, number>;
}

export type ChromosomalSex = "XX" | "XY" | "XXY" | "XO" | "mosaic" | "unknown";

export type GonadalSex =
  | "ovaries"
  | "testes"
  | "ovotestes"
  | "streak_gonads"
  | "undifferentiated";

export type PhenotypicSex = "female" | "male" | "intersex" | "ambiguous";

export type ReproductiveRole = "dam" | "sire" | "sterile" | "limited";

export interface SexDevelopment {
  chromosomal: ChromosomalSex;
  gonadal: GonadalSex;
  phenotypic: PhenotypicSex;
  reproductiveRole: ReproductiveRole;
  developmentalAnomalies: string[];
}

export interface ReproductionState {
  pregnant: boolean;
  gestationProgress: number;
  litterCount: number;
  currentSireId: string | null;
  currentSireName: string | null;
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

  sex: SexDevelopment;
  reproduction: ReproductionState;

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