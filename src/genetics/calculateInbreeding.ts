import type { Animal } from "../types/animal";

export interface InbreedingResult {
  coefficient: number;
  tier: "none" | "low" | "moderate" | "high" | "severe";
  sharedAncestors: string[];
  directRelationship: string | null;
  fertilityMultiplier: number;
  stabilityMultiplier: number;
  notes: string;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function findAnimalById(animals: Animal[], id: string | null): Animal | null {
  if (!id) return null;
  return animals.find((animal) => animal.id === id) ?? null;
}

function collectAncestors(
  animal: Animal,
  animals: Animal[],
  maxDepth: number,
  currentDepth = 0,
  ancestors = new Map<string, number>()
): Map<string, number> {
  if (currentDepth >= maxDepth) {
    return ancestors;
  }

  const mother = findAnimalById(animals, animal.motherId);
  const father = findAnimalById(animals, animal.fatherId);

  for (const parent of [mother, father]) {
    if (!parent) continue;

    const depth = currentDepth + 1;
    const existingDepth = ancestors.get(parent.id);

    if (existingDepth === undefined || depth < existingDepth) {
      ancestors.set(parent.id, depth);
    }

    collectAncestors(parent, animals, maxDepth, depth, ancestors);
  }

  return ancestors;
}

function getDirectRelationshipCoefficient(
  parentA: Animal,
  parentB: Animal,
  animals: Animal[],
  maxDepth: number
): { coefficient: number; label: string | null } {
  if (parentA.id === parentB.id) {
    return {
      coefficient: 0.5,
      label: "same_animal",
    };
  }

  const ancestorsA = collectAncestors(parentA, animals, maxDepth);
  const ancestorsB = collectAncestors(parentB, animals, maxDepth);

  const depthBInA = ancestorsA.get(parentB.id);
  const depthAInB = ancestorsB.get(parentA.id);

  if (depthBInA !== undefined) {
    return {
      coefficient: round(Math.pow(0.5, depthBInA + 1)),
      label:
        depthBInA === 1
          ? "parent_child"
          : depthBInA === 2
            ? "grandparent_grandchild"
            : "direct_ancestor_descendant",
    };
  }

  if (depthAInB !== undefined) {
    return {
      coefficient: round(Math.pow(0.5, depthAInB + 1)),
      label:
        depthAInB === 1
          ? "parent_child"
          : depthAInB === 2
            ? "grandparent_grandchild"
            : "direct_ancestor_descendant",
    };
  }

  return {
    coefficient: 0,
    label: null,
  };
}

function getInbreedingTier(
  coefficient: number
): InbreedingResult["tier"] {
  if (coefficient >= 0.375) return "severe";
  if (coefficient >= 0.25) return "high";
  if (coefficient >= 0.125) return "moderate";
  if (coefficient >= 0.03125) return "low";
  return "none";
}

function getNotes(
  tier: InbreedingResult["tier"],
  directRelationship: string | null
): string {
  if (directRelationship === "same_animal") {
    return "Invalid self-pairing level relationship. Severe inbreeding penalties applied.";
  }

  if (directRelationship === "parent_child") {
    return "Parent-child relationship detected. High inbreeding risk.";
  }

  if (directRelationship === "grandparent_grandchild") {
    return "Grandparent-grandchild relationship detected. Moderate inbreeding risk.";
  }

  if (tier === "severe") {
    return "Severe shared ancestry detected.";
  }

  if (tier === "high") {
    return "High shared ancestry detected.";
  }

  if (tier === "moderate") {
    return "Moderate shared ancestry detected.";
  }

  if (tier === "low") {
    return "Low shared ancestry detected.";
  }

  return "No meaningful shared ancestry detected within pedigree search depth.";
}

export function calculateInbreeding(
  parentA: Animal,
  parentB: Animal,
  animals: Animal[],
  maxDepth = 6
): InbreedingResult {
  const ancestorsA = collectAncestors(parentA, animals, maxDepth);
  const ancestorsB = collectAncestors(parentB, animals, maxDepth);

  const sharedAncestors: string[] = [];
  let commonAncestorCoefficient = 0;

  for (const [ancestorId, depthA] of ancestorsA.entries()) {
    const depthB = ancestorsB.get(ancestorId);

    if (depthB === undefined) {
      continue;
    }

    const ancestor = findAnimalById(animals, ancestorId);
    const ancestorInbreeding = ancestor?.inbreedingCoefficient ?? 0;

    sharedAncestors.push(ancestorId);

    commonAncestorCoefficient +=
      Math.pow(0.5, depthA + depthB + 1) *
      (1 + ancestorInbreeding);
  }

  const directRelationship = getDirectRelationshipCoefficient(
    parentA,
    parentB,
    animals,
    maxDepth
  );

  const coefficient = round(
    Math.min(
      0.5,
      Math.max(commonAncestorCoefficient, directRelationship.coefficient)
    )
  );

  const tier = getInbreedingTier(coefficient);

  const fertilityMultiplier = round(
    Math.max(0.1, 1 - coefficient * 0.85)
  );

  const stabilityMultiplier = round(
    Math.max(0.1, 1 - coefficient * 0.75)
  );

  return {
    coefficient,
    tier,
    sharedAncestors,
    directRelationship: directRelationship.label,
    fertilityMultiplier,
    stabilityMultiplier,
    notes: getNotes(tier, directRelationship.label),
  };
}