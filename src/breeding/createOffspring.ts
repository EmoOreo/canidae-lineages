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

function round(value: number): number {
  return Math.round(value * 100) / 100;
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

  const generation = Math.max(parentA.generation, parentB.generation) + 1;

  const averageFertility =
    (parentA.stats.fertility + parentB.stats.fertility) / 2;

  const averageStability =
    (parentA.stats.stability + parentB.stats.stability) / 2;

  const fertility = round(
    averageFertility *
      compatibility.compatibility *
      (1 - compatibility.sterilityChance) *
      inbreedingResult.fertilityMultiplier
  );

  const stability = round(
    averageStability *
      compatibility.compatibility *
      inbreedingResult.stabilityMultiplier
  );

  const mutation = resolveMutation(
    compatibility.compatibility,
    compatibility.mutationModifier,
    mutationData
  );

  const mutationIds = mutation.mutationApplied ? [mutation.mutationId!] : [];

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

    sex: createOffspringSexDevelopment(),

    reproduction: {
      pregnant: false,
      gestationProgress: 0,
      litterCount: 0,
      currentSireId: null,
      currentSireName: null,
    },

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
    },

    stats: {
      fertility,
      stability,
    },
  };
}