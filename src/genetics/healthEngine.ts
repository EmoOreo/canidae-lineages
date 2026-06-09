import type { Animal, HealthGrade, PolygenicHealthProfile } from "../types/animal";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function vary(value: number, amount = 0.06): number {
  return clamp01(value + (Math.random() * amount * 2 - amount));
}

function gradeFromOverall(overallHealth: number): HealthGrade {
  if (overallHealth >= 0.9) return "excellent";
  if (overallHealth >= 0.8) return "good";
  if (overallHealth >= 0.7) return "fair";
  if (overallHealth >= 0.6) return "poor";
  return "high_risk";
}

function addLiabilityNote(notes: string[], label: string, value: number) {
  if (value >= 0.6) {
    notes.push(`High ${label} liability.`);
    return;
  }

  if (value >= 0.35) {
    notes.push(`Elevated ${label} liability.`);
  }
}

function buildNotes(
  profile: Omit<PolygenicHealthProfile, "overallHealth" | "healthGrade" | "healthNotes">,
  inbreedingCoefficient = 0
): string[] {
  const notes: string[] = [];

  addLiabilityNote(notes, "hip dysplasia", profile.hipDysplasiaLiability);
  addLiabilityNote(notes, "elbow dysplasia", profile.elbowDysplasiaLiability);
  addLiabilityNote(notes, "cardiac", profile.cardiacLiability);
  addLiabilityNote(notes, "respiratory", profile.respiratoryLiability);
  addLiabilityNote(notes, "immune fragility", profile.immuneFragility);
  addLiabilityNote(notes, "neurological", profile.neurologicalLiability);
  addLiabilityNote(notes, "dental", profile.dentalLiability);
  addLiabilityNote(notes, "cancer susceptibility", profile.cancerSusceptibility);

  if (profile.geneticRobustness <= 0.6) notes.push("Reduced genetic robustness.");
  if (profile.longevityPotential <= 0.6) notes.push("Reduced longevity potential.");
  if (inbreedingCoefficient >= 0.2) notes.push("Health affected by elevated inbreeding.");
  if (profile.geneticRobustness >= 0.85) notes.push("Strong genetic robustness.");
  if (profile.longevityPotential >= 0.85) notes.push("Strong longevity potential.");

  return notes.length ? notes : ["No major polygenic health warnings."];
}

function finalizeHealthProfile(
  partial: Omit<PolygenicHealthProfile, "overallHealth" | "healthGrade" | "healthNotes">,
  inbreedingCoefficient = 0
): PolygenicHealthProfile {
  const averageLiability =
    (
      partial.hipDysplasiaLiability +
      partial.elbowDysplasiaLiability +
      partial.cardiacLiability +
      partial.respiratoryLiability +
      partial.immuneFragility +
      partial.neurologicalLiability +
      partial.dentalLiability +
      partial.cancerSusceptibility
    ) / 8;

  const overallHealth = clamp01(
    partial.geneticRobustness * 0.45 +
      partial.longevityPotential * 0.3 +
      (1 - averageLiability) * 0.25
  );

  const roundedPartial = {
    hipDysplasiaLiability: round(partial.hipDysplasiaLiability),
    elbowDysplasiaLiability: round(partial.elbowDysplasiaLiability),
    cardiacLiability: round(partial.cardiacLiability),
    respiratoryLiability: round(partial.respiratoryLiability),
    immuneFragility: round(partial.immuneFragility),
    neurologicalLiability: round(partial.neurologicalLiability),
    dentalLiability: round(partial.dentalLiability),
    cancerSusceptibility: round(partial.cancerSusceptibility),
    longevityPotential: round(partial.longevityPotential),
    geneticRobustness: round(partial.geneticRobustness),
  };

  return {
    ...roundedPartial,
    overallHealth: round(overallHealth),
    healthGrade: gradeFromOverall(overallHealth),
    healthNotes: buildNotes(roundedPartial, inbreedingCoefficient),
  };
}

function getFounderBaseHealth(speciesId: string): Omit<PolygenicHealthProfile, "overallHealth" | "healthGrade" | "healthNotes"> {
  const defaults = {
    hipDysplasiaLiability: 0.25,
    elbowDysplasiaLiability: 0.22,
    cardiacLiability: 0.22,
    respiratoryLiability: 0.2,
    immuneFragility: 0.2,
    neurologicalLiability: 0.18,
    dentalLiability: 0.22,
    cancerSusceptibility: 0.22,
    longevityPotential: 0.7,
    geneticRobustness: 0.75,
  };

  const profiles: Record<string, typeof defaults> = {
    canis_lupus_familiaris: {
      hipDysplasiaLiability: 0.36,
      elbowDysplasiaLiability: 0.28,
      cardiacLiability: 0.24,
      respiratoryLiability: 0.22,
      immuneFragility: 0.24,
      neurologicalLiability: 0.22,
      dentalLiability: 0.32,
      cancerSusceptibility: 0.28,
      longevityPotential: 0.68,
      geneticRobustness: 0.7,
    },
    canis_lupus: {
      hipDysplasiaLiability: 0.16,
      elbowDysplasiaLiability: 0.14,
      cardiacLiability: 0.16,
      respiratoryLiability: 0.12,
      immuneFragility: 0.14,
      neurologicalLiability: 0.13,
      dentalLiability: 0.14,
      cancerSusceptibility: 0.18,
      longevityPotential: 0.76,
      geneticRobustness: 0.88,
    },
    canis_latrans: {
      hipDysplasiaLiability: 0.12,
      elbowDysplasiaLiability: 0.12,
      cardiacLiability: 0.14,
      respiratoryLiability: 0.1,
      immuneFragility: 0.1,
      neurologicalLiability: 0.12,
      dentalLiability: 0.14,
      cancerSusceptibility: 0.16,
      longevityPotential: 0.82,
      geneticRobustness: 0.92,
    },
    vulpes_vulpes: {
      hipDysplasiaLiability: 0.13,
      elbowDysplasiaLiability: 0.12,
      cardiacLiability: 0.15,
      respiratoryLiability: 0.12,
      immuneFragility: 0.16,
      neurologicalLiability: 0.16,
      dentalLiability: 0.18,
      cancerSusceptibility: 0.18,
      longevityPotential: 0.74,
      geneticRobustness: 0.84,
    },
    vulpes_zerda: {
      hipDysplasiaLiability: 0.1,
      elbowDysplasiaLiability: 0.1,
      cardiacLiability: 0.14,
      respiratoryLiability: 0.12,
      immuneFragility: 0.16,
      neurologicalLiability: 0.15,
      dentalLiability: 0.22,
      cancerSusceptibility: 0.16,
      longevityPotential: 0.78,
      geneticRobustness: 0.82,
    },
    aenocyon_dirus: {
      hipDysplasiaLiability: 0.34,
      elbowDysplasiaLiability: 0.3,
      cardiacLiability: 0.28,
      respiratoryLiability: 0.24,
      immuneFragility: 0.35,
      neurologicalLiability: 0.24,
      dentalLiability: 0.22,
      cancerSusceptibility: 0.3,
      longevityPotential: 0.58,
      geneticRobustness: 0.62,
    },
  };

  return profiles[speciesId] ?? defaults;
}

export function createFounderHealthProfile(species: any): PolygenicHealthProfile {
  const base = getFounderBaseHealth(species.id);
  const dnaCompleteness = species.status === "extinct" ? 0.75 : 1;
  const dnaPenalty = 1 - dnaCompleteness;

  return finalizeHealthProfile({
    hipDysplasiaLiability: vary(base.hipDysplasiaLiability + dnaPenalty * 0.12),
    elbowDysplasiaLiability: vary(base.elbowDysplasiaLiability + dnaPenalty * 0.12),
    cardiacLiability: vary(base.cardiacLiability + dnaPenalty * 0.1),
    respiratoryLiability: vary(base.respiratoryLiability + dnaPenalty * 0.08),
    immuneFragility: vary(base.immuneFragility + dnaPenalty * 0.2),
    neurologicalLiability: vary(base.neurologicalLiability + dnaPenalty * 0.08),
    dentalLiability: vary(base.dentalLiability + dnaPenalty * 0.08),
    cancerSusceptibility: vary(base.cancerSusceptibility + dnaPenalty * 0.08),
    longevityPotential: vary(base.longevityPotential - dnaPenalty * 0.12),
    geneticRobustness: vary(base.geneticRobustness - dnaPenalty * 0.18),
  });
}

function inheritLiability(a: number, b: number, inbreedingCoefficient: number, modifier = 1): number {
  const average = (a + b) / 2;
  const variance = Math.random() * 0.08 - 0.04;
  const inbreedingPenalty = inbreedingCoefficient * modifier;

  return clamp01(average + variance + inbreedingPenalty);
}

function inheritPositive(a: number, b: number, inbreedingCoefficient: number, modifier = 1): number {
  const average = (a + b) / 2;
  const variance = Math.random() * 0.08 - 0.04;
  const inbreedingPenalty = inbreedingCoefficient * modifier;

  return clamp01(average + variance - inbreedingPenalty);
}

export function inheritHealthProfile(
  parentA: Animal,
  parentB: Animal,
  inbreedingCoefficient: number
): PolygenicHealthProfile {
  const healthA = parentA.health ?? createFounderHealthProfile({ id: parentA.speciesId });
  const healthB = parentB.health ?? createFounderHealthProfile({ id: parentB.speciesId });

  return finalizeHealthProfile({
    hipDysplasiaLiability: inheritLiability(
      healthA.hipDysplasiaLiability,
      healthB.hipDysplasiaLiability,
      inbreedingCoefficient,
      0.44
    ),
    elbowDysplasiaLiability: inheritLiability(
      healthA.elbowDysplasiaLiability,
      healthB.elbowDysplasiaLiability,
      inbreedingCoefficient,
      0.38
    ),
    cardiacLiability: inheritLiability(
      healthA.cardiacLiability,
      healthB.cardiacLiability,
      inbreedingCoefficient,
      0.35
    ),
    respiratoryLiability: inheritLiability(
      healthA.respiratoryLiability,
      healthB.respiratoryLiability,
      inbreedingCoefficient,
      0.28
    ),
    immuneFragility: inheritLiability(
      healthA.immuneFragility,
      healthB.immuneFragility,
      inbreedingCoefficient,
      0.52
    ),
    neurologicalLiability: inheritLiability(
      healthA.neurologicalLiability,
      healthB.neurologicalLiability,
      inbreedingCoefficient,
      0.33
    ),
    dentalLiability: inheritLiability(
      healthA.dentalLiability,
      healthB.dentalLiability,
      inbreedingCoefficient,
      0.23
    ),
    cancerSusceptibility: inheritLiability(
      healthA.cancerSusceptibility,
      healthB.cancerSusceptibility,
      inbreedingCoefficient,
      0.32
    ),
    longevityPotential: inheritPositive(
      healthA.longevityPotential,
      healthB.longevityPotential,
      inbreedingCoefficient,
      0.25
    ),
    geneticRobustness: inheritPositive(
      healthA.geneticRobustness,
      healthB.geneticRobustness,
      inbreedingCoefficient,
      0.44
    ),
  }, inbreedingCoefficient);
}

export function createFallbackHealthProfile(): PolygenicHealthProfile {
  return finalizeHealthProfile({
    hipDysplasiaLiability: 0.25,
    elbowDysplasiaLiability: 0.25,
    cardiacLiability: 0.25,
    respiratoryLiability: 0.25,
    immuneFragility: 0.25,
    neurologicalLiability: 0.25,
    dentalLiability: 0.25,
    cancerSusceptibility: 0.25,
    longevityPotential: 0.7,
    geneticRobustness: 0.75,
  });
}
