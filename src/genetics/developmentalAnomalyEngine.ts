import type {
  Animal,
  DevelopmentalAnomalyProfile,
  DevelopmentalAnomalyRecord,
  SexDevelopment,
} from "../types/animal";

interface DevelopmentalRiskOptions {
  hybridCompatibility?: number;
  mutationLoad?: number;
  baselineStability?: number;
  inheritedLiability?: number;
  label?: string;
}

const CATALOG_VERSION = "0.2.0";

export const DEVELOPMENTAL_ANOMALY_CATALOG: DevelopmentalAnomalyRecord[] = [
  {
    id: "cryptorchidism",
    label: "Cryptorchidism",
    category: "reproductive_development",
    severity: "moderate",
    fertilityModifier: -0.25,
    healthModifier: -0.03,
    stabilityModifier: -0.04,
    inheritability: "strong",
    notes:
      "One or both testes fail to descend; primarily affects sire fertility.",
  },
  {
    id: "malocclusion",
    label: "Malocclusion",
    category: "craniofacial_development",
    severity: "moderate",
    fertilityModifier: 0,
    healthModifier: -0.08,
    stabilityModifier: -0.05,
    inheritability: "predisposition",
    notes: "Jaw or tooth alignment problem that can affect feeding efficiency.",
  },
  {
    id: "malformed_tail",
    label: "Malformed Tail",
    category: "axial_skeleton",
    severity: "minor",
    fertilityModifier: 0,
    healthModifier: -0.02,
    stabilityModifier: -0.03,
    inheritability: "predisposition",
    notes: "Kinked, shortened, or malformed tail vertebrae.",
  },
  {
    id: "polydactyly",
    label: "Polydactyly",
    category: "limb_development",
    severity: "minor",
    fertilityModifier: 0,
    healthModifier: -0.01,
    stabilityModifier: -0.02,
    inheritability: "predisposition",
    notes:
      "Extra digit formation; usually survivable but flags developmental noise.",
  },
  {
    id: "microphthalmia",
    label: "Microphthalmia",
    category: "ocular_development",
    severity: "moderate",
    fertilityModifier: 0,
    healthModifier: -0.08,
    stabilityModifier: -0.07,
    inheritability: "strong",
    notes: "Underdeveloped eye tissue; can affect one or both eyes.",
  },
  {
    id: "chondrodysplasia_dwarfism",
    label: "Chondrodysplasia / Dwarfism",
    category: "skeletal_growth",
    severity: "moderate",
    fertilityModifier: -0.05,
    healthModifier: -0.12,
    stabilityModifier: -0.08,
    inheritability: "strong",
    notes:
      "Disproportionate skeletal growth condition; future structural system can refine this.",
  },
  {
    id: "gigantism_overgrowth",
    label: "Gigantism / Overgrowth",
    category: "skeletal_growth",
    severity: "moderate",
    fertilityModifier: -0.05,
    healthModifier: -0.1,
    stabilityModifier: -0.08,
    inheritability: "predisposition",
    notes:
      "Excessive growth pattern; can increase cardiac and orthopedic burden.",
  },
  {
    id: "cleft_palate",
    label: "Cleft Palate",
    category: "craniofacial_development",
    severity: "major",
    fertilityModifier: -0.1,
    healthModifier: -0.25,
    stabilityModifier: -0.18,
    inheritability: "strong",
    notes: "Craniofacial midline defect; severe neonatal survival impact.",
  },
  {
    id: "limb_reduction_defect",
    label: "Limb Reduction Defect",
    category: "limb_development",
    severity: "major",
    fertilityModifier: -0.1,
    healthModifier: -0.2,
    stabilityModifier: -0.18,
    inheritability: "strong",
    notes:
      "Incomplete or malformed limb development; major functional penalty.",
  },
  {
    id: "severe_craniofacial_defect",
    label: "Severe Craniofacial Defect",
    category: "craniofacial_development",
    severity: "severe",
    fertilityModifier: -0.5,
    healthModifier: -0.45,
    stabilityModifier: -0.35,
    inheritability: "strong",
    notes:
      "Severe craniofacial developmental failure; very poor survival outlook.",
  },
  {
    id: "nonviable_development",
    label: "Nonviable Developmental Disorder",
    category: "systemic_development",
    severity: "severe",
    fertilityModifier: -1,
    healthModifier: -0.7,
    stabilityModifier: -0.6,
    inheritability: "strong",
    notes:
      "Severe systemic developmental failure; future neonatal mortality system can consume this.",
  },
  {
    id: "xy_gonadal_dysgenesis",
    label: "XY Gonadal Dysgenesis",
    category: "sex_development",
    severity: "major",
    fertilityModifier: -0.95,
    healthModifier: -0.08,
    stabilityModifier: -0.12,
    inheritability: "strong",
    notes:
      "XY chromosomal pattern with incomplete gonadal development; reserved for later advanced DSD simulation.",
  },
  {
    id: "xx_ovotesticular_dsd",
    label: "XX Ovotesticular DSD",
    category: "sex_development",
    severity: "major",
    fertilityModifier: -0.75,
    healthModifier: -0.05,
    stabilityModifier: -0.1,
    inheritability: "strong",
    notes:
      "XX individual with ovotesticular tissue; reserved for later advanced DSD simulation.",
  },
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function getFounderBaselineStability(speciesId: string): number {
  const baselines: Record<string, number> = {
    canis_lupus_familiaris: 0.9,
    canis_lupus: 0.95,
    canis_latrans: 0.98,
    vulpes_vulpes: 0.94,
    vulpes_zerda: 0.93,
    aenocyon_dirus: 0.85,
  };

  return baselines[speciesId] ?? 0.9;
}

function buildRiskFactors(
  riskScore: number,
  inbreedingCoefficient: number,
  dnaCompleteness: number,
  hybridCompatibility: number,
  mutationLoad: number,
  baselineStability: number,
  inheritedLiability: number,
): string[] {
  const factors: string[] = [];

  if (baselineStability < 0.85) {
    factors.push("Reduced baseline developmental stability.");
  }

  if (inbreedingCoefficient >= 0.2) {
    factors.push("Elevated inbreeding increases developmental risk.");
  } else if (inbreedingCoefficient >= 0.1) {
    factors.push("Moderate inbreeding contributes to developmental risk.");
  }

  if (dnaCompleteness < 0.85) {
    factors.push(
      "Incomplete or reconstructed DNA reduces developmental confidence.",
    );
  }

  if (hybridCompatibility < 0.5) {
    factors.push(
      "Distant hybrid compatibility increases developmental instability.",
    );
  } else if (hybridCompatibility < 0.8) {
    factors.push("Hybrid pairing adds mild developmental instability.");
  }

  if (mutationLoad >= 2) {
    factors.push("Multiple mutations increase developmental risk.");
  } else if (mutationLoad === 1) {
    factors.push("Mutation load adds minor developmental risk.");
  }

  if (inheritedLiability >= 0.18) {
    factors.push("Strong inherited developmental anomaly liability detected.");
  } else if (inheritedLiability >= 0.06) {
    factors.push("Inherited developmental anomaly predisposition detected.");
  }

  if (riskScore <= 0.08 && factors.length === 0) {
    factors.push("No major developmental risk factors detected.");
  }

  return factors;
}

export function createDevelopmentalAnomalyProfile(
  inbreedingCoefficient = 0,
  dnaCompleteness = 1,
  options: DevelopmentalRiskOptions = {},
): DevelopmentalAnomalyProfile {
  const hybridCompatibility = options.hybridCompatibility ?? 1;
  const mutationLoad = options.mutationLoad ?? 0;
  const baselineStability = options.baselineStability ?? 0.92;

  const baselineRisk = clamp01(1 - baselineStability);
  const dnaPenalty = clamp01(1 - dnaCompleteness);
  const hybridPenalty = clamp01(1 - hybridCompatibility);
  const mutationPenalty = Math.min(0.25, mutationLoad * 0.04);
  const inheritedLiability = clamp01(options.inheritedLiability ?? 0);

  const riskScore = clamp01(
    baselineRisk * 0.68 +
      inbreedingCoefficient * 0.75 +
      dnaPenalty * 0.55 +
      hybridPenalty * 0.04 +
      mutationPenalty +
      inheritedLiability * 0.7,
  );

  const developmentalStability = clamp01(1 - riskScore);

  return {
    anomalies: [],
    riskScore: round(riskScore),
    developmentalStability: round(developmentalStability),
    inheritedLiability: round(inheritedLiability),
    inheritedAnomalyLineage: [],
    riskFactors: buildRiskFactors(
      riskScore,
      inbreedingCoefficient,
      dnaCompleteness,
      hybridCompatibility,
      mutationLoad,
      baselineStability,
      inheritedLiability,
    ),
    catalogVersion: CATALOG_VERSION,
  };
}

export function createFounderDevelopmentalAnomalyProfile(
  species: any,
): DevelopmentalAnomalyProfile {
  const dnaCompleteness = species.status === "extinct" ? 0.75 : 1;
  const baselineStability = getFounderBaselineStability(species.id);

  return createDevelopmentalAnomalyProfile(0, dnaCompleteness, {
    baselineStability,
    label: species.id,
  });
}

function findAnomalyRecord(id: string): DevelopmentalAnomalyRecord | null {
  return (
    DEVELOPMENTAL_ANOMALY_CATALOG.find((record) => record.id === id) ?? null
  );
}

function inheritedLiabilityFromParent(parent: Animal): number {
  const anomalies = parent.developmentalAnomalyProfile?.anomalies ?? [];
  const directLiability = anomalies.reduce((sum, anomalyId) => {
    const record = findAnomalyRecord(anomalyId);

    if (!record) {
      return sum;
    }

    if (record.inheritability === "strong") {
      return sum + 0.14;
    }

    if (record.inheritability === "predisposition") {
      return sum + 0.06;
    }

    return sum;
  }, 0);

  const backgroundLiability =
    (parent.developmentalAnomalyProfile?.inheritedLiability ?? 0) * 0.35;

  return clamp01(directLiability + backgroundLiability);
}

function inheritedAnomalyLineageFromParents(
  parentA: Animal,
  parentB: Animal,
): string[] {
  return Array.from(
    new Set([
      ...(parentA.developmentalAnomalyProfile?.inheritedAnomalyLineage ?? []),
      ...(parentB.developmentalAnomalyProfile?.inheritedAnomalyLineage ?? []),
      ...(parentA.developmentalAnomalyProfile?.anomalies ?? []).map(
        (id) => `${parentA.name}:${id}`,
      ),
      ...(parentB.developmentalAnomalyProfile?.anomalies ?? []).map(
        (id) => `${parentB.name}:${id}`,
      ),
    ]),
  );
}

export function inheritDevelopmentalAnomalyProfile(
  parentA: Animal,
  parentB: Animal,
  inbreedingCoefficient: number,
  hybridCompatibility: number,
  mutationLoad: number,
): DevelopmentalAnomalyProfile {
  const parentStabilityA =
    parentA.developmentalAnomalyProfile?.developmentalStability ?? 0.9;
  const parentStabilityB =
    parentB.developmentalAnomalyProfile?.developmentalStability ?? 0.9;
  const baselineStability = clamp01((parentStabilityA + parentStabilityB) / 2);

  const parentDnaCompleteness = Math.min(
    Number(parentA.phenotype.trait_dna_completeness ?? 1),
    Number(parentB.phenotype.trait_dna_completeness ?? 1),
  );

  const inheritedLiability = clamp01(
    inheritedLiabilityFromParent(parentA) +
      inheritedLiabilityFromParent(parentB),
  );

  const inheritedAnomalyLineage = inheritedAnomalyLineageFromParents(
    parentA,
    parentB,
  );

  const profile = createDevelopmentalAnomalyProfile(
    inbreedingCoefficient,
    parentDnaCompleteness,
    {
      baselineStability,
      hybridCompatibility,
      mutationLoad,
      inheritedLiability,
    },
  );

  return {
    ...profile,
    inheritedAnomalyLineage,
  };
}

function anomalyChanceFromProfile(
  profile: DevelopmentalAnomalyProfile,
  inbreedingCoefficient: number,
  hybridCompatibility: number,
  mutationLoad: number,
): number {
  const hybridPenalty = clamp01(1 - hybridCompatibility);

  // Phase 1D.3C / 1D.5I risk-curve rebalance:
  // The generator, assignment, save, and UI paths have been validated.
  // 1D.5I softens DNA and hybrid penalties after population-test baselines showed
  // Dog/Wolf × Dire Wolf hybrids clustering near a 40-50% anomaly rate.
  // This keeps reconstructed/extinct hybrids risky without making them collapse by default.
  // Approximate target curve:
  // risk 0.05 -> ~0.5-1%
  // risk 0.10 -> ~2-3%
  // risk 0.15 -> ~5-7%
  // risk 0.20 -> ~10-12%
  // risk 0.25 -> ~15-18%
  // risk 0.30 -> ~22-26%
  // risk 0.35 -> ~30-35%
  // risk 0.40+ -> capped around 45-50%
  let chance = 0.002;
  const risk = profile.riskScore;

  if (risk < 0.08) {
    chance += risk * 0.08;
  } else if (risk < 0.15) {
    chance += 0.006 + (risk - 0.08) * 0.34;
  } else if (risk < 0.22) {
    chance += 0.03 + (risk - 0.15) * 0.95;
  } else if (risk < 0.3) {
    chance += 0.096 + (risk - 0.22) * 1.45;
  } else if (risk < 0.4) {
    chance += 0.212 + (risk - 0.3) * 1.9;
  } else {
    chance += 0.402 + (risk - 0.4) * 0.5;
  }

  const inbreedingChance =
    inbreedingCoefficient >= 0.25
      ? 0.045
      : inbreedingCoefficient >= 0.125
        ? 0.022
        : inbreedingCoefficient * 0.08;

  const hybridChance = hybridPenalty * 0.02;
  const mutationChance = Math.min(0.09, mutationLoad * 0.035);
  const inheritedChance = Math.min(
    0.18,
    (profile.inheritedLiability ?? 0) * 0.55,
  );

  chance += inbreedingChance + hybridChance + mutationChance + inheritedChance;

  return clamp01(Math.min(0.5, chance));
}

function severityWeight(
  record: DevelopmentalAnomalyRecord,
  riskScore: number,
): number {
  if (record.category === "sex_development") {
    return 0;
  }

  const weights: Record<string, number> = {
    minor: riskScore < 0.12 ? 8 : 4,
    moderate: riskScore < 0.12 ? 2 : 5,
    major: riskScore < 0.18 ? 0.25 : 2,
    severe: riskScore < 0.26 ? 0.02 : 0.4,
  };

  return weights[record.severity] ?? 1;
}

function isRecordAllowedForSex(
  record: DevelopmentalAnomalyRecord,
  sex: SexDevelopment,
): boolean {
  if (record.id === "cryptorchidism") {
    return sex.chromosomal === "XY" || sex.reproductiveRole === "sire";
  }

  return true;
}

function weightedPick(
  records: DevelopmentalAnomalyRecord[],
  riskScore: number,
  sex: SexDevelopment,
): DevelopmentalAnomalyRecord | null {
  const weighted = records
    .filter((record) => isRecordAllowedForSex(record, sex))
    .map((record) => ({ record, weight: severityWeight(record, riskScore) }))
    .filter((entry) => entry.weight > 0);

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let roll = Math.random() * totalWeight;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.record;
    }
  }

  return weighted[weighted.length - 1]?.record ?? null;
}

export function generateDevelopmentalAnomalies(
  profile: DevelopmentalAnomalyProfile,
  sex: SexDevelopment,
  inbreedingCoefficient: number,
  hybridCompatibility: number,
  mutationLoad: number,
): DevelopmentalAnomalyRecord[] {
  const chance = anomalyChanceFromProfile(
    profile,
    inbreedingCoefficient,
    hybridCompatibility,
    mutationLoad,
  );

  if (Math.random() > chance) {
    return [];
  }

  const first = weightedPick(
    DEVELOPMENTAL_ANOMALY_CATALOG,
    profile.riskScore,
    sex,
  );

  if (!first) {
    return [];
  }

  const anomalies = [first];

  const secondChance =
    profile.riskScore >= 0.35
      ? 0.16
      : profile.riskScore >= 0.3
        ? 0.11
        : profile.riskScore >= 0.22
          ? 0.06
          : 0.005;
  if (Math.random() < secondChance) {
    const second = weightedPick(
      DEVELOPMENTAL_ANOMALY_CATALOG.filter((record) => record.id !== first.id),
      profile.riskScore,
      sex,
    );

    if (second) {
      anomalies.push(second);
    }
  }

  return anomalies;
}

export function applyGeneratedAnomaliesToProfile(
  profile: DevelopmentalAnomalyProfile,
  records: DevelopmentalAnomalyRecord[],
): DevelopmentalAnomalyProfile {
  if (records.length === 0) {
    return profile;
  }

  const stabilityPenalty = records.reduce(
    (sum, record) => sum + Math.abs(record.stabilityModifier),
    0,
  );

  return {
    ...profile,
    anomalies: Array.from(
      new Set([...profile.anomalies, ...records.map((record) => record.id)]),
    ),
    riskFactors: Array.from(
      new Set([
        ...profile.riskFactors,
        ...records.map(
          (record) => `${record.label} generated during development.`,
        ),
      ]),
    ),
    developmentalStability: round(
      clamp01(profile.developmentalStability - stabilityPenalty),
    ),
    riskScore: round(clamp01(profile.riskScore + stabilityPenalty)),
  };
}

export function createFallbackDevelopmentalAnomalyProfile(): DevelopmentalAnomalyProfile {
  return {
    anomalies: [],
    riskScore: 0,
    developmentalStability: 1,
    inheritedLiability: 0,
    inheritedAnomalyLineage: [],
    riskFactors: ["No major developmental risk factors detected."],
    catalogVersion: CATALOG_VERSION,
  };
}
