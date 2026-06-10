import type { Animal, SexDevelopment } from "../types/animal";
import type { CompatibilityResult } from "./resolveCompatibility";
import { resolveLineage } from "../lineage/resolveLineage";
import { resolveMutation } from "../genetics/resolveMutation";
import { resolveTraits } from "../genetics/resolveTraits";
import { createHybridName } from "./createHybridName";
import type { InbreedingResult } from "../genetics/calculateInbreeding";
import {
  getRecessiveCarriersFromGenotype,
  inheritGenotype,
} from "../genetics/genotypeEngine";
import { evaluatePhenotypeFromGenotype } from "../genetics/phenotypeEngine";
import { normalizeCarriers } from "../genetics/normalizeCarriers";
import { inheritHealthProfile } from "../genetics/healthEngine";
import {
  applyGeneratedAnomaliesToProfile,
  generateDevelopmentalAnomalies,
  inheritDevelopmentalAnomalyProfile,
} from "../genetics/developmentalAnomalyEngine";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getDnaCompleteness(animal: Animal): number {
  const raw = Number(animal.phenotype?.trait_dna_completeness ?? 1);

  if (Number.isNaN(raw)) {
    return 1;
  }

  return clamp01(raw);
}

function inheritDnaCompleteness(parentA: Animal, parentB: Animal): number {
  const parentDnaA = getDnaCompleteness(parentA);
  const parentDnaB = getDnaCompleteness(parentB);
  const average = (parentDnaA + parentDnaB) / 2;

  // Small biological/reconstruction variance keeps cloned values from feeling rigid
  // while avoiding unrealistic improvement beyond the stronger parent.
  const variance = Math.random() * 0.04 - 0.02;
  const upperBound = Math.max(parentDnaA, parentDnaB);
  const lowerBound = Math.max(0.5, Math.min(parentDnaA, parentDnaB) - 0.05);

  return round(Math.max(lowerBound, Math.min(upperBound, clamp01(average + variance))));
}

function dnaCompletenessPenalty(dnaCompleteness: number): number {
  return clamp01(Math.max(0, 0.9 - dnaCompleteness));
}

function dnaFertilityMultiplier(dnaCompleteness: number): number {
  const penalty = dnaCompletenessPenalty(dnaCompleteness);
  return clamp01(1 - penalty * 0.75);
}

function dnaStabilityMultiplier(dnaCompleteness: number): number {
  const penalty = dnaCompletenessPenalty(dnaCompleteness);
  return clamp01(1 - penalty * 1.05);
}

function dnaMutationModifier(dnaCompleteness: number): number {
  const penalty = dnaCompletenessPenalty(dnaCompleteness);
  return 1 + penalty * 2.2;
}

function healthGradeFromOverall(
  overallHealth: number
): "excellent" | "good" | "fair" | "poor" | "high_risk" {
  if (overallHealth >= 0.9) return "excellent";
  if (overallHealth >= 0.8) return "good";
  if (overallHealth >= 0.7) return "fair";
  if (overallHealth >= 0.6) return "poor";
  return "high_risk";
}

function createAncestrySnapshot(
  parentA: Animal,
  parentB: Animal,
  lineage: Record<string, number>
) {
  return {
    parentIds: [parentA.id, parentB.id],
    founderIds: Array.from(
      new Set([
        ...(parentA.ancestry?.founderIds ?? []),
        ...(parentB.ancestry?.founderIds ?? []),
      ])
    ),
    ancestorIds: Array.from(
      new Set([
        parentA.id,
        parentB.id,
        ...(parentA.ancestry?.ancestorIds ?? []),
        ...(parentB.ancestry?.ancestorIds ?? []),
      ])
    ),
    lineage,
  };
}

function createOffspringSexDevelopment(): SexDevelopment {
  if (Math.random() < 0.5) {
    return {
      chromosomal: "XX",
      gonadal: "ovaries",
      phenotypic: "female",
      reproductiveRole: "dam",
      developmentalAnomalies: [],
    };
  }

  return {
    chromosomal: "XY",
    gonadal: "testes",
    phenotypic: "male",
    reproductiveRole: "sire",
    developmentalAnomalies: [],
  };
}

export function createOffspring(
  parentA: Animal,
  parentB: Animal,
  compatibility: CompatibilityResult,
  mutationData: any,
  inbreedingResult: InbreedingResult,
  phenotypeRulesData: any
): Animal {
  const lineage = resolveLineage(parentA, parentB);
  const traitResult = resolveTraits(parentA, parentB);
  const genotype = inheritGenotype(parentA, parentB);
  const phenotype = evaluatePhenotypeFromGenotype(
    genotype,
    traitResult.phenotype,
    phenotypeRulesData
  );

  const inheritedDnaCompleteness = inheritDnaCompleteness(parentA, parentB);
  phenotype.trait_dna_completeness = inheritedDnaCompleteness;

  let health = inheritHealthProfile(
    parentA,
    parentB,
    inbreedingResult.coefficient
  );
  const generation = Math.max(parentA.generation, parentB.generation) + 1;

  const averageFertility =
    (parentA.stats.fertility + parentB.stats.fertility) / 2;

  const averageStability =
    (parentA.stats.stability + parentB.stats.stability) / 2;

  const fertility = round(
    averageFertility *
      compatibility.compatibility *
      (1 - compatibility.sterilityChance) *
      inbreedingResult.fertilityMultiplier *
      dnaFertilityMultiplier(inheritedDnaCompleteness) *
      Math.max(0.35, health.overallHealth)
  );

  const stability = round(
    averageStability *
      compatibility.compatibility *
      inbreedingResult.stabilityMultiplier *
      dnaStabilityMultiplier(inheritedDnaCompleteness) *
      Math.max(0.45, health.geneticRobustness)
  );

  const mutation = resolveMutation(
    compatibility.compatibility,
    compatibility.mutationModifier * dnaMutationModifier(inheritedDnaCompleteness),
    mutationData
  );

  const mutationIds = mutation.mutationApplied ? [mutation.mutationId!] : [];

  let developmentalAnomalyProfile = inheritDevelopmentalAnomalyProfile(
    parentA,
    parentB,
    inbreedingResult.coefficient,
    compatibility.compatibility,
    mutationIds.length
  );

  const sex = createOffspringSexDevelopment();
  const generatedAnomalies = generateDevelopmentalAnomalies(
    developmentalAnomalyProfile,
    sex,
    inbreedingResult.coefficient,
    compatibility.compatibility,
    mutationIds.length
  );

  developmentalAnomalyProfile = applyGeneratedAnomaliesToProfile(
    developmentalAnomalyProfile,
    generatedAnomalies
  );

  const anomalyFertilityModifier = generatedAnomalies.reduce(
    (sum, anomaly) => sum + anomaly.fertilityModifier,
    0
  );
  const anomalyHealthModifier = generatedAnomalies.reduce(
    (sum, anomaly) => sum + anomaly.healthModifier,
    0
  );
  const anomalyStabilityModifier = generatedAnomalies.reduce(
    (sum, anomaly) => sum + anomaly.stabilityModifier,
    0
  );

  if (generatedAnomalies.length > 0) {
    const adjustedOverallHealth = clamp01(health.overallHealth + anomalyHealthModifier);
    health = {
      ...health,
      overallHealth: round(adjustedOverallHealth),
      healthGrade: healthGradeFromOverall(adjustedOverallHealth),
      healthNotes: Array.from(
        new Set([
          ...health.healthNotes,
          ...generatedAnomalies.map(
            (anomaly) => `${anomaly.label} affects developmental outcome.`
          ),
        ])
      ),
    };
  }

  const dnaPenalty = dnaCompletenessPenalty(inheritedDnaCompleteness);

  if (dnaPenalty > 0) {
    const adjustedOverallHealth = clamp01(health.overallHealth - dnaPenalty * 0.45);
    const adjustedRobustness = clamp01(health.geneticRobustness - dnaPenalty * 0.65);
    const adjustedLongevity = clamp01(health.longevityPotential - dnaPenalty * 0.35);

    health = {
      ...health,
      overallHealth: round(adjustedOverallHealth),
      geneticRobustness: round(adjustedRobustness),
      longevityPotential: round(adjustedLongevity),
      healthGrade: healthGradeFromOverall(adjustedOverallHealth),
      healthNotes: Array.from(
        new Set([
          ...health.healthNotes,
          "Incomplete or reconstructed DNA reduces health confidence.",
        ])
      ),
    };
  }

  genotype.inheritedMutations = Array.from(
    new Set([...genotype.inheritedMutations, ...mutationIds])
  );

  const hybridName = createHybridName(parentA, parentB);

  return {
    id: `offspring_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name: `${hybridName} G${generation}`,
    speciesId: "hybrid",
    generation,

    motherId: parentA.id,
    fatherId: parentB.id,
    motherName: parentA.name,
    fatherName: parentB.name,

    sex: {
      ...sex,
      developmentalAnomalies: Array.from(
        new Set([
          ...sex.developmentalAnomalies,
          ...generatedAnomalies
            .filter((anomaly) => anomaly.category === "sex_development" || anomaly.id === "cryptorchidism")
            .map((anomaly) => anomaly.id),
        ])
      ),
      reproductiveRole: generatedAnomalies.some((anomaly) => anomaly.id === "cryptorchidism")
        ? "limited"
        : sex.reproductiveRole,
    },

    reproduction: {
      pregnant: false,
      gestationProgress: 0,
      litterCount: 0,
      currentSireId: null,
      currentSireName: null,
    },

    health,
    developmentalAnomalyProfile,

    inbreedingCoefficient: inbreedingResult.coefficient,
    inbreedingTier: inbreedingResult.tier,

    genotype,

    ancestry: createAncestrySnapshot(parentA, parentB, lineage),

    genome: {
      D: Object.keys(phenotype),
      R: normalizeCarriers([
        ...traitResult.recessiveCarriers,
        ...getRecessiveCarriersFromGenotype(genotype),
      ]),
      M: mutationIds,
      L: lineage,
    },

    phenotype: {
      ...phenotype,
      trait_inbreeding_coefficient: inbreedingResult.coefficient,
      trait_dna_completeness: inheritedDnaCompleteness,
      trait_mutation_rate: round(
        Number(phenotype.trait_mutation_rate ?? 0.05) *
          dnaMutationModifier(inheritedDnaCompleteness)
      ),
    },

    stats: {
      fertility: round(Math.max(0, fertility + anomalyFertilityModifier)),
      stability: round(Math.max(0, stability + anomalyStabilityModifier * 100)),
    },
  };
}
