import type { Genotype, TraitValue } from "../types/animal";

interface RuleCondition {
  type: "always" | "hasAllele" | "homozygous" | "dominantEquals";
  locus?: string;
  allele?: string;
}

interface RuleAction {
  type: "setTrait" | "setTraitIfGreater" | "setTraitIfLower" | "setTraitFromDominantMap";
  trait: string;
  value?: TraitValue;
  locus?: string;
  map?: Record<string, TraitValue>;
}

interface PhenotypeRule {
  id: string;
  description?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

interface PhenotypeRulesData {
  rules?: PhenotypeRule[];
}

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

function conditionMatches(condition: RuleCondition, genotype: Genotype): boolean {
  if (condition.type === "always") {
    return true;
  }

  if (!condition.locus || !condition.allele) {
    return false;
  }

  if (condition.type === "hasAllele") {
    return hasAllele(genotype, condition.locus, condition.allele);
  }

  if (condition.type === "homozygous") {
    return isHomozygous(genotype, condition.locus, condition.allele);
  }

  if (condition.type === "dominantEquals") {
    return dominantAllele(genotype, condition.locus) === condition.allele;
  }

  return false;
}

function ruleMatches(rule: PhenotypeRule, genotype: Genotype): boolean {
  return rule.conditions.every((condition) => conditionMatches(condition, genotype));
}

function applyAction(
  action: RuleAction,
  genotype: Genotype,
  phenotype: Record<string, TraitValue>
) {
  if (action.type === "setTrait") {
    if (action.value !== undefined) {
      phenotype[action.trait] = action.value;
    }

    return;
  }

  if (action.type === "setTraitIfGreater") {
    if (typeof action.value !== "number") {
      return;
    }

    const currentValue = Number(phenotype[action.trait] ?? 0);
    phenotype[action.trait] = Math.max(currentValue, action.value);
    return;
  }

  if (action.type === "setTraitIfLower") {
    if (typeof action.value !== "number") {
      return;
    }

    const currentValue = Number(phenotype[action.trait] ?? 1);
    phenotype[action.trait] = Math.min(currentValue, action.value);
    return;
  }

  if (action.type === "setTraitFromDominantMap") {
    if (!action.locus || !action.map) {
      return;
    }

    const allele = dominantAllele(genotype, action.locus);

    if (!allele) {
      return;
    }

    const mappedValue = action.map[allele];

    if (mappedValue !== undefined) {
      phenotype[action.trait] = mappedValue;
    }
  }
}

export function evaluatePhenotypeFromGenotype(
  genotype: Genotype,
  basePhenotype: Record<string, TraitValue>,
  phenotypeRulesData: PhenotypeRulesData
): Record<string, TraitValue> {
  const phenotype: Record<string, TraitValue> = {
    ...basePhenotype,
  };

  const rules = phenotypeRulesData.rules ?? [];

  for (const rule of rules) {
    if (!ruleMatches(rule, genotype)) {
      continue;
    }

    for (const action of rule.actions) {
      applyAction(action, genotype, phenotype);
    }
  }

  return phenotype;
}