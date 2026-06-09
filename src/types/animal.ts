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

export type HealthGrade = "excellent" | "good" | "fair" | "poor" | "high_risk";

export interface PolygenicHealthProfile {
  hipDysplasiaLiability: number;
  elbowDysplasiaLiability: number;
  cardiacLiability: number;
  respiratoryLiability: number;
  immuneFragility: number;
  neurologicalLiability: number;
  dentalLiability: number;
  cancerSusceptibility: number;
  longevityPotential: number;
  geneticRobustness: number;
  overallHealth: number;
  healthGrade: HealthGrade;
  healthNotes: string[];
}

export type DevelopmentalAnomalySeverity =
  | "minor"
  | "moderate"
  | "major"
  | "severe";

export type DevelopmentalAnomalyInheritability =
  | "none"
  | "predisposition"
  | "strong";

export interface DevelopmentalAnomalyRecord {
  id: string;
  label: string;
  category: string;
  severity: DevelopmentalAnomalySeverity;
  fertilityModifier: number;
  healthModifier: number;
  stabilityModifier: number;
  inheritability: DevelopmentalAnomalyInheritability;
  notes: string;
}

export interface DevelopmentalAnomalyProfile {
  anomalies: string[];
  riskScore: number;
  developmentalStability: number;
  inheritedLiability: number;
  inheritedAnomalyLineage: string[];
  riskFactors: string[];
  catalogVersion: string;
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
  health: PolygenicHealthProfile;
  developmentalAnomalyProfile: DevelopmentalAnomalyProfile;

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
