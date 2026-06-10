import "./style.css";
import { createFounderAnimals } from "./genetics/createFounderAnimals";
import { resolveCompatibility } from "./breeding/resolveCompatibility";
import { createLitter } from "./breeding/createLitter";
import { calculateInbreeding } from "./genetics/calculateInbreeding";
import { normalizeCarriers } from "./genetics/normalizeCarriers";
import { calculatePopulationStats } from "./stats/calculatePopulationStats";
import { createFallbackHealthProfile } from "./genetics/healthEngine";
import { createFallbackDevelopmentalAnomalyProfile } from "./genetics/developmentalAnomalyEngine";
import {
  advancePregnancy,
  canBecomePregnant,
  clearPregnancyAfterBirth,
  isReadyToGiveBirth,
  startPregnancy,
} from "./reproduction/reproductionEngine";
import type { Animal, Genotype, SexDevelopment } from "./types/animal";

const SAVE_KEY = "canidae-lineages-save-v1";

interface SaveData {
  animals: Animal[];
}

type BreedMode = "realistic" | "sandbox";
type SortMode = "name" | "generation" | "fertility" | "stability" | "mutations";

interface KennelFilters {
  search: string;
  species: string;
  generation: string;
  sort: SortMode;
}

const DEFAULT_FILTERS: KennelFilters = {
  search: "",
  species: "all",
  generation: "all",
  sort: "name",
};

async function loadJson(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(
      `${path} failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function createFallbackGenotype(animal: Animal): Genotype {
  return {
    loci: {},
    inheritedMutations: animal.genome?.M ?? [],
  };
}

function createFallbackSex(indexSeed: string): SexDevelopment {
  const isFemale = indexSeed.length % 2 === 0;

  if (isFemale) {
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

function migrateFounderId(id: string): string {
  const idMap: Record<string, string> = {
    founder_0: "founder_domestic_dog_alpha",
    founder_1: "founder_gray_wolf_alpha",
    founder_2: "founder_coyote_alpha",
    founder_3: "founder_red_fox_alpha",
    founder_4: "founder_fennec_fox_alpha",
    founder_5: "founder_dire_wolf_alpha",
  };

  return idMap[id] ?? id;
}

function migrateIdArray(ids: string[] = []): string[] {
  return Array.from(new Set(ids.map(migrateFounderId)));
}

function migrateAnimal(animal: Animal): Animal {
  const lineage = animal.genome?.L ?? animal.ancestry?.lineage ?? {};
  const parentIds = [animal.motherId, animal.fatherId].filter(
    Boolean,
  ) as string[];

  const migratedId = migrateFounderId(animal.id);
  const migratedMotherId = animal.motherId
    ? migrateFounderId(animal.motherId)
    : null;
  const migratedFatherId = animal.fatherId
    ? migrateFounderId(animal.fatherId)
    : null;

  return {
    ...animal,
    id: migratedId,
    motherId: migratedMotherId,
    fatherId: migratedFatherId,
    motherName: animal.motherName ?? null,
    fatherName: animal.fatherName ?? null,
    sex: animal.sex ?? createFallbackSex(migratedId),
    reproduction: {
      pregnant: animal.reproduction?.pregnant ?? false,
      gestationProgress: animal.reproduction?.gestationProgress ?? 0,
      litterCount: animal.reproduction?.litterCount ?? 0,
      currentSireId: animal.reproduction?.currentSireId ?? null,
      currentSireName: animal.reproduction?.currentSireName ?? null,
    },
    health: animal.health ?? createFallbackHealthProfile(),
    developmentalAnomalyProfile: {
      ...createFallbackDevelopmentalAnomalyProfile(),
      ...(animal.developmentalAnomalyProfile ?? {}),
      inheritedLiability:
        animal.developmentalAnomalyProfile?.inheritedLiability ?? 0,
      inheritedAnomalyLineage:
        animal.developmentalAnomalyProfile?.inheritedAnomalyLineage ?? [],
    },
    inbreedingCoefficient: animal.inbreedingCoefficient ?? 0,
    inbreedingTier: animal.inbreedingTier ?? "none",
    genotype: animal.genotype ?? createFallbackGenotype(animal),
    ancestry: {
      parentIds: migrateIdArray(animal.ancestry?.parentIds ?? parentIds),
      founderIds: animal.ancestry?.founderIds?.length
        ? migrateIdArray(animal.ancestry.founderIds)
        : animal.generation === 0
          ? [migratedId]
          : [],
      ancestorIds: migrateIdArray(animal.ancestry?.ancestorIds ?? parentIds),
      lineage,
    },
    genome: {
      ...(animal.genome ?? { D: [], R: [], M: [], L: lineage }),
      R: normalizeCarriers(animal.genome?.R ?? []),
      L: lineage,
    },
    phenotype: {
      ...(animal.phenotype ?? {}),
      trait_inbreeding_coefficient:
        animal.inbreedingCoefficient ??
        Number(animal.phenotype?.trait_inbreeding_coefficient ?? 0),
    },
  };
}

function saveAnimals(animals: Animal[]) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ animals }));
}

function loadSavedAnimals(): Animal[] | null {
  const rawSave = localStorage.getItem(SAVE_KEY);
  if (!rawSave) return null;

  try {
    const parsed = JSON.parse(rawSave) as SaveData;
    return Array.isArray(parsed.animals)
      ? parsed.animals.map(migrateAnimal)
      : null;
  } catch {
    return null;
  }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

function getSexSymbol(animal: Animal): string {
  if (animal.sex?.reproductiveRole === "dam") return "♀";
  if (animal.sex?.reproductiveRole === "sire") return "♂";
  if (animal.sex?.reproductiveRole === "limited") return "⚥";
  return "∅";
}

function canServeAsDam(animal: Animal): boolean {
  return (
    animal.sex?.reproductiveRole === "dam" ||
    animal.sex?.reproductiveRole === "limited"
  );
}

function canServeAsSire(animal: Animal): boolean {
  return (
    animal.sex?.reproductiveRole === "sire" ||
    animal.sex?.reproductiveRole === "limited"
  );
}

function resolveBreedingRoles(
  selectedA: Animal,
  selectedB: Animal,
  mode: BreedMode,
): {
  dam: Animal;
  sire: Animal;
  blocked: boolean;
  reason: string | null;
} {
  if (canServeAsDam(selectedA) && canServeAsSire(selectedB)) {
    return {
      dam: selectedA,
      sire: selectedB,
      blocked: false,
      reason: null,
    };
  }

  if (canServeAsDam(selectedB) && canServeAsSire(selectedA)) {
    return {
      dam: selectedB,
      sire: selectedA,
      blocked: false,
      reason: null,
    };
  }

  if (mode === "sandbox") {
    return {
      dam: selectedA,
      sire: selectedB,
      blocked: false,
      reason: null,
    };
  }

  return {
    dam: selectedA,
    sire: selectedB,
    blocked: true,
    reason:
      "Realistic Mode requires one viable dam-role animal and one viable sire-role animal.",
  };
}

function renderPopulationStats(animals: Animal[]): string {
  const stats = calculatePopulationStats(animals);

  return `
    <section>
      <h3>Population Statistics</h3>
      <p><strong>Population Size:</strong> ${stats.populationSize}</p>
      <p><strong>Species Represented:</strong> ${stats.speciesRepresented}</p>
      <p><strong>Average Fertility:</strong> ${stats.averageFertility}</p>
      <p><strong>Average Stability:</strong> ${stats.averageStability}</p>
      <p><strong>Highest Inbreeding:</strong> ${stats.highestInbreedingCoefficient} (${stats.highestInbreedingAnimalName})</p>
      <p><strong>Total Mutations Present:</strong> ${stats.mutationCount}</p>
      <p><strong>Most Common Founder:</strong> ${stats.mostCommonFounderId} (${stats.mostCommonFounderCount})</p>
      <p><strong>Pregnant Animals:</strong> ${animals.filter((animal) => animal.reproduction?.pregnant).length}</p>
      <p><strong>Birth-Ready Animals:</strong> ${animals.filter(isReadyToGiveBirth).length}</p>
      <p><strong>Average Overall Health:</strong> ${
        animals.length
          ? Math.round(
              (animals.reduce(
                (sum, animal) => sum + (animal.health?.overallHealth ?? 0.7),
                0,
              ) /
                animals.length) *
                100,
            ) / 100
          : 0
      }</p>
      <p><strong>Lowest Health Grade:</strong> ${animals.reduce(
        (lowest, animal) => {
          const order = ["excellent", "good", "fair", "poor", "high_risk"];
          const currentGrade = animal.health?.healthGrade ?? "good";
          return order.indexOf(currentGrade) > order.indexOf(lowest)
            ? currentGrade
            : lowest;
        },
        "excellent",
      )}</p>
    </section>
  `;
}

function averageNumber(values: number[]): number {
  if (values.length === 0) return 0;

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 100,
  ) / 100;
}

function renderPopulationTestReport(report: any): string {
  if (!report) {
    return "<p>No population test run yet.</p>";
  }

  if (report.action === "standard_founder_suite") {
    return `
      <p><strong>Standard Founder Suite Complete.</strong></p>
      <p><strong>Tests Run:</strong> ${report.reports?.length ?? 0}</p>
      <p><strong>Target Births Per Test:</strong> ${report.targetBirths ?? 50}</p>
      <pre>${JSON.stringify(report, null, 2)}</pre>
    `;
  }

  return `
    <pre>${JSON.stringify(report, null, 2)}</pre>
  `;
}

function runPopulationTest(
  selectedA: Animal,
  selectedB: Animal,
  mode: BreedMode,
  species: any,
  mutations: any,
  animals: Animal[],
  phenotypeRules: any,
  targetBirths = 50,
): {
  report: any;
  latestTestOffspring: Animal | null;
} {
  const roleResult = resolveBreedingRoles(selectedA, selectedB, mode);

  if (roleResult.blocked) {
    return {
      latestTestOffspring: null,
      report: {
        action: "population_test_preview",
        blocked: true,
        blockedReason: roleResult.reason,
      },
    };
  }

  const compatibility = resolveCompatibility(
    roleResult.dam,
    roleResult.sire,
    species,
  );

  if (mode === "realistic" && !compatibility.realisticAllowed) {
    return {
      latestTestOffspring: null,
      report: {
        action: "population_test_preview",
        blocked: true,
        blockedReason:
          "This pairing is blocked in Realistic Mode. Try Sandbox Mode.",
        compatibility,
      },
    };
  }

  const safeTarget = Math.max(1, Math.min(250, Math.round(targetBirths || 50)));
  const simulatedPups: Animal[] = [];
  let littersGenerated = 0;

  while (simulatedPups.length < safeTarget && littersGenerated < 250) {
    const litter = createLitter(
      roleResult.dam,
      roleResult.sire,
      compatibility,
      mutations,
      animals,
      phenotypeRules,
    );

    simulatedPups.push(...litter);
    littersGenerated += 1;
  }

  const pups = simulatedPups.slice(0, safeTarget);
  const anomalyIds = pups.flatMap(
    (pup) => pup.developmentalAnomalyProfile?.anomalies ?? [],
  );
  const mutationIds = pups.flatMap((pup) => pup.genome?.M ?? []);
  const dnaCompletenessValues = pups.map((pup) =>
    Number(pup.phenotype?.trait_dna_completeness ?? 1),
  );

  return {
    latestTestOffspring: pups[pups.length - 1] ?? null,
    report: {
      action: "population_test_preview",
      savedToKennel: false,
      targetBirths: safeTarget,
      birthsGenerated: pups.length,
      littersGenerated,
      dam: {
        name: roleResult.dam.name,
        id: roleResult.dam.id,
        health: roleResult.dam.health?.overallHealth ?? null,
      },
      sire: {
        name: roleResult.sire.name,
        id: roleResult.sire.id,
        health: roleResult.sire.health?.overallHealth ?? null,
      },
      compatibility,
      averages: {
        fertility: averageNumber(pups.map((pup) => pup.stats.fertility)),
        stability: averageNumber(pups.map((pup) => pup.stats.stability)),
        overallHealth: averageNumber(
          pups.map((pup) => pup.health?.overallHealth ?? 0),
        ),
        geneticRobustness: averageNumber(
          pups.map((pup) => pup.health?.geneticRobustness ?? 0),
        ),
        dnaCompleteness: averageNumber(dnaCompletenessValues),
        developmentalRisk: averageNumber(
          pups.map(
            (pup) => pup.developmentalAnomalyProfile?.riskScore ?? 0,
          ),
        ),
        developmentalStability: averageNumber(
          pups.map(
            (pup) =>
              pup.developmentalAnomalyProfile?.developmentalStability ?? 0,
          ),
        ),
      },
      minimums: {
        fertility: pups.length
          ? Math.min(...pups.map((pup) => pup.stats.fertility))
          : 0,
        stability: pups.length
          ? Math.min(...pups.map((pup) => pup.stats.stability))
          : 0,
        overallHealth: pups.length
          ? Math.min(...pups.map((pup) => pup.health?.overallHealth ?? 0))
          : 0,
        dnaCompleteness: dnaCompletenessValues.length
          ? Math.min(...dnaCompletenessValues)
          : 0,
      },
      anomalyCount: anomalyIds.length,
      anomalyFrequency:
        pups.length > 0
          ? Math.round((anomalyIds.length / pups.length) * 1000) / 1000
          : 0,
      anomalyBreakdown: anomalyIds.reduce(
        (counts: Record<string, number>, anomalyId) => {
          counts[anomalyId] = (counts[anomalyId] ?? 0) + 1;
          return counts;
        },
        {},
      ),
      mutationCount: mutationIds.length,
      mutationFrequency:
        pups.length > 0
          ? Math.round((mutationIds.length / pups.length) * 1000) / 1000
          : 0,
      mutationBreakdown: mutationIds.reduce(
        (counts: Record<string, number>, mutationId) => {
          counts[mutationId] = (counts[mutationId] ?? 0) + 1;
          return counts;
        },
        {},
      ),
      note:
        "Preview only. These simulated offspring were not saved to the kennel.",
    },
  };
}

function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function objectBreakdownToMarkdown(
  title: string,
  breakdown: Record<string, number> | undefined,
): string {
  const entries = Object.entries(breakdown ?? {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return `## ${title}

None
`;
  }

  return `## ${title}

${entries.map(([key, value]) => `- ${key}: ${value}`).join("\n")}
`;
}

function createPopulationReportMarkdown(report: any): string {
  if (!report || report.action !== "population_test_preview") {
    return "# Population Test Report\\n\\nNo population test report available.\\n";
  }

  const generatedAt = new Date().toISOString();
  const pairingLabel = `${report.dam?.name ?? "Unknown Dam"} × ${
    report.sire?.name ?? "Unknown Sire"
  }`;

  return `# Population Test Report

## Metadata

Generated At: ${generatedAt}  
Simulator Phase: Phase 1D.5H  
Mode: Population Test Preview  
Saved To Kennel: ${report.savedToKennel ? "Yes" : "No"}  
Target Births: ${report.targetBirths ?? "Unknown"}  
Births Generated: ${report.birthsGenerated ?? 0}  
Litters Generated: ${report.littersGenerated ?? 0}  

## Pairing

Pairing: ${pairingLabel}

### Dam

Name: ${report.dam?.name ?? "Unknown"}  
ID: ${report.dam?.id ?? "Unknown"}  
Health: ${report.dam?.health ?? "Unknown"}  

### Sire

Name: ${report.sire?.name ?? "Unknown"}  
ID: ${report.sire?.id ?? "Unknown"}  
Health: ${report.sire?.health ?? "Unknown"}  

## Compatibility

Tier: ${report.compatibility?.tier ?? "Unknown"}  
Label: ${report.compatibility?.label ?? "Unknown"}  
Compatibility: ${report.compatibility?.compatibility ?? "Unknown"}  
Sterility Chance: ${report.compatibility?.sterilityChance ?? "Unknown"}  
Mutation Modifier: ${report.compatibility?.mutationModifier ?? "Unknown"}  
Realistic Allowed: ${report.compatibility?.realisticAllowed ? "Yes" : "No"}  
Sandbox Allowed: ${report.compatibility?.sandboxAllowed ? "Yes" : "No"}  
Notes: ${report.compatibility?.notes ?? "None"}  

## Population Results

Average Fertility: ${report.averages?.fertility ?? 0}  
Average Stability: ${report.averages?.stability ?? 0}  
Average Overall Health: ${report.averages?.overallHealth ?? 0}  
Average Genetic Robustness: ${report.averages?.geneticRobustness ?? 0}  
Average DNA Completeness: ${report.averages?.dnaCompleteness ?? 0}  
Average Developmental Risk: ${report.averages?.developmentalRisk ?? 0}  
Average Developmental Stability: ${report.averages?.developmentalStability ?? 0}  

## Minimums

Minimum Fertility: ${report.minimums?.fertility ?? 0}  
Minimum Stability: ${report.minimums?.stability ?? 0}  
Minimum Overall Health: ${report.minimums?.overallHealth ?? 0}  
Minimum DNA Completeness: ${report.minimums?.dnaCompleteness ?? 0}  

## Anomalies

Anomaly Count: ${report.anomalyCount ?? 0}  
Anomaly Frequency: ${formatPercent(report.anomalyFrequency ?? 0)}  

${objectBreakdownToMarkdown("Anomaly Breakdown", report.anomalyBreakdown)}

## Mutations

Mutation Count: ${report.mutationCount ?? 0}  
Mutation Frequency: ${formatPercent(report.mutationFrequency ?? 0)}  

${objectBreakdownToMarkdown("Mutation Breakdown", report.mutationBreakdown)}

## Raw JSON

\`\`\`json
${JSON.stringify(report, null, 2)}
\`\`\`

## Notes

${report.note ?? "Preview only. These simulated offspring were not saved to the kennel."}
`;
}

function createPopulationReportFilename(report: any): string {
  const dam = slugify(report?.dam?.name ?? "unknown-dam");
  const sire = slugify(report?.sire?.name ?? "unknown-sire");
  const births = report?.birthsGenerated ?? report?.targetBirths ?? "x";

  return `population-test-${dam}-x-${sire}-${births}-births.md`;
}

interface StandardSuiteCase {
  id: string;
  label: string;
  damId: string;
  sireId: string;
}

const STANDARD_FOUNDER_SUITE: StandardSuiteCase[] = [
  {
    id: "dog-wolf",
    label: "Domestic Dog × Gray Wolf",
    damId: "founder_domestic_dog_alpha",
    sireId: "founder_gray_wolf_alpha",
  },
  {
    id: "dog-direwolf",
    label: "Domestic Dog × Dire Wolf",
    damId: "founder_domestic_dog_alpha",
    sireId: "founder_dire_wolf_alpha",
  },
  {
    id: "wolf-direwolf",
    label: "Gray Wolf × Dire Wolf",
    damId: "founder_gray_wolf_alpha",
    sireId: "founder_dire_wolf_alpha",
  },
  {
    id: "dog-coyote",
    label: "Domestic Dog × Coyote",
    damId: "founder_domestic_dog_alpha",
    sireId: "founder_coyote_alpha",
  },
  {
    id: "dog-redfox",
    label: "Domestic Dog × Red Fox",
    damId: "founder_domestic_dog_alpha",
    sireId: "founder_red_fox_alpha",
  },
  {
    id: "dog-fennec",
    label: "Domestic Dog × Fennec Fox",
    damId: "founder_domestic_dog_alpha",
    sireId: "founder_fennec_fox_alpha",
  },
];

function runStandardFounderSuite(
  species: any,
  mutations: any,
  animals: Animal[],
  phenotypeRules: any,
  targetBirths = 50,
): any {
  const mode: BreedMode = "sandbox";

  const reports = STANDARD_FOUNDER_SUITE.map((testCase) => {
    const dam = findAnimalById(animals, testCase.damId);
    const sire = findAnimalById(animals, testCase.sireId);

    if (!dam || !sire) {
      return {
        action: "population_test_preview",
        suiteCaseId: testCase.id,
        suiteCaseLabel: testCase.label,
        blocked: true,
        blockedReason: `Missing test animals for ${testCase.label}.`,
      };
    }

    const result = runPopulationTest(
      dam,
      sire,
      mode,
      species,
      mutations,
      animals,
      phenotypeRules,
      targetBirths,
    );

    return {
      ...result.report,
      suiteCaseId: testCase.id,
      suiteCaseLabel: testCase.label,
    };
  });

  return {
    action: "standard_founder_suite",
    generatedAt: new Date().toISOString(),
    savedToKennel: false,
    mode,
    targetBirths,
    reports,
    note:
      "Preview only. Standard founder suite reports were not saved to the kennel.",
  };
}

function createSuiteSummaryMarkdown(suite: any): string {
  if (!suite || suite.action !== "standard_founder_suite") {
    return "# Standard Founder Suite Summary\\n\\nNo suite report available.\\n";
  }

  const tableRows = (suite.reports ?? [])
    .map((report: any) => {
      if (report.blocked) {
        return `| ${report.suiteCaseLabel ?? report.suiteCaseId} | BLOCKED | ${report.blockedReason ?? "Unknown"} | | | | | | | | |`;
      }

      return `| ${report.suiteCaseLabel} | ${report.birthsGenerated} | ${report.littersGenerated} | ${report.compatibility?.tier ?? ""} | ${report.compatibility?.compatibility ?? ""} | ${report.averages?.fertility ?? 0} | ${report.averages?.stability ?? 0} | ${report.averages?.overallHealth ?? 0} | ${report.averages?.dnaCompleteness ?? 0} | ${report.averages?.developmentalRisk ?? 0} | ${formatPercent(report.anomalyFrequency ?? 0)} | ${formatPercent(report.mutationFrequency ?? 0)} |`;
    })
    .join("\n");

  const detailedReports = (suite.reports ?? [])
    .map((report: any) =>
      report.blocked
        ? `# ${report.suiteCaseLabel ?? report.suiteCaseId}\n\nBLOCKED: ${report.blockedReason ?? "Unknown"}\n`
        : createPopulationReportMarkdown(report),
    )
    .join("\n\n---\n\n");

  return `# Standard Founder Population Test Suite

## Metadata

Generated At: ${suite.generatedAt}  
Mode: ${suite.mode}  
Target Births Per Test: ${suite.targetBirths}  
Saved To Kennel: ${suite.savedToKennel ? "Yes" : "No"}  

## Summary Table

| Pairing | Births | Litters | Tier | Compatibility | Avg Fertility | Avg Stability | Avg Health | Avg DNA | Avg Dev Risk | Anomaly Freq | Mutation Freq |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${tableRows}

## Notes

${suite.note}

---

${detailedReports}
`;
}

function createSuiteJsonMarkdown(suite: any): string {
  return `# Standard Founder Suite Raw JSON

\`\`\`json
${JSON.stringify(suite, null, 2)}
\`\`\`
`;
}

function renderPhenotype(phenotype: Record<string, unknown>): string {
  return Object.entries(phenotype)
    .map(
      ([key, value]) =>
        `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`,
    )
    .join("");
}

function renderGenotype(genotype: Genotype): string {
  const loci = genotype?.loci ?? {};

  if (Object.keys(loci).length === 0) {
    return "<p>No genotype loci stored for this saved animal.</p>";
  }

  return `
    <ul>
      ${Object.entries(loci)
        .map(
          ([locus, pair]) =>
            `<li><strong>${locus}:</strong> ${pair.maternal} / ${pair.paternal}</li>`,
        )
        .join("")}
    </ul>
  `;
}

function renderHealthProfile(animal: Animal): string {
  const health = animal.health ?? createFallbackHealthProfile();

  return `
    <ul>
      <li><strong>Overall Health:</strong> ${health.overallHealth}</li>
      <li><strong>Health Grade:</strong> ${health.healthGrade}</li>
      <li><strong>Genetic Robustness:</strong> ${health.geneticRobustness}</li>
      <li><strong>Longevity Potential:</strong> ${health.longevityPotential}</li>
      <li><strong>Hip Dysplasia Liability:</strong> ${health.hipDysplasiaLiability}</li>
      <li><strong>Elbow Dysplasia Liability:</strong> ${health.elbowDysplasiaLiability}</li>
      <li><strong>Cardiac Liability:</strong> ${health.cardiacLiability}</li>
      <li><strong>Respiratory Liability:</strong> ${health.respiratoryLiability}</li>
      <li><strong>Immune Fragility:</strong> ${health.immuneFragility}</li>
      <li><strong>Neurological Liability:</strong> ${health.neurologicalLiability}</li>
      <li><strong>Dental Liability:</strong> ${health.dentalLiability}</li>
      <li><strong>Cancer Susceptibility:</strong> ${health.cancerSusceptibility}</li>
      <li><strong>Health Notes:</strong> ${health.healthNotes?.length ? health.healthNotes.join(" ") : "None"}</li>
    </ul>
  `;
}

function renderDevelopmentalAnomalyProfile(animal: Animal): string {
  const profile =
    animal.developmentalAnomalyProfile ??
    createFallbackDevelopmentalAnomalyProfile();

  return `
    <ul>
      <li><strong>Developmental Stability:</strong> ${profile.developmentalStability}</li>
      <li><strong>Developmental Risk Score:</strong> ${profile.riskScore}</li>
      <li><strong>Inherited Developmental Liability:</strong> ${profile.inheritedLiability ?? 0}</li>
      <li><strong>Inherited Anomaly Lineage:</strong> ${
        profile.inheritedAnomalyLineage?.length
          ? profile.inheritedAnomalyLineage.join(", ")
          : "None"
      }</li>
      <li><strong>Risk Factors:</strong> ${
        profile.riskFactors?.length ? profile.riskFactors.join(" ") : "None"
      }</li>
      <li><strong>Catalog Version:</strong> ${profile.catalogVersion ?? "0.1.0"}</li>
      <li><strong>Anomalies:</strong> ${
        profile.anomalies.length ? profile.anomalies.join(", ") : "None"
      }</li>
    </ul>
  `;
}

function renderSexDevelopment(animal: Animal): string {
  return `
    <ul>
      <li><strong>Chromosomal:</strong> ${animal.sex?.chromosomal ?? "unknown"}</li>
      <li><strong>Gonadal:</strong> ${animal.sex?.gonadal ?? "unknown"}</li>
      <li><strong>Phenotypic:</strong> ${animal.sex?.phenotypic ?? "unknown"}</li>
      <li><strong>Reproductive Role:</strong> ${animal.sex?.reproductiveRole ?? "unknown"}</li>
      <li><strong>Developmental Anomalies:</strong> ${
        animal.sex?.developmentalAnomalies?.length
          ? animal.sex.developmentalAnomalies.join(", ")
          : "None"
      }</li>
      <li><strong>Pregnant:</strong> ${animal.reproduction?.pregnant ? "Yes" : "No"}</li>
      <li><strong>Gestation Progress:</strong> ${
        animal.reproduction?.gestationProgress ?? 0
      } / 3</li>
      <li><strong>Current Sire:</strong> ${
        animal.reproduction?.currentSireName ?? "None"
      }</li>
      <li><strong>Litter Count:</strong> ${animal.reproduction?.litterCount ?? 0}</li>
    </ul>
  `;
}

function getLegacyTraitCarriers(animal: Animal): string[] {
  return (animal.genome.R ?? []).filter((carrier) =>
    carrier.startsWith("trait_"),
  );
}

function getGenotypeCarriers(animal: Animal): string[] {
  return (animal.genome.R ?? []).filter(
    (carrier) => !carrier.startsWith("trait_"),
  );
}

function renderCarrierSummary(animal: Animal): string {
  const legacyTraitCarriers = getLegacyTraitCarriers(animal);
  const genotypeCarriers = getGenotypeCarriers(animal);

  return `
    <p><strong>Hidden Trait Carriers:</strong> ${
      legacyTraitCarriers.length ? legacyTraitCarriers.length : "None"
    }</p>
    <p><strong>Genotype Carrier Loci:</strong> ${
      genotypeCarriers.length ? genotypeCarriers.length : "None"
    }</p>

    <details>
      <summary>Carrier Details</summary>

      <h5>Hidden Trait Carriers</h5>
      ${
        legacyTraitCarriers.length
          ? `<ul>${legacyTraitCarriers.map((carrier) => `<li>${carrier}</li>`).join("")}</ul>`
          : "<p>None</p>"
      }

      <h5>Genotype Carrier Loci</h5>
      ${
        genotypeCarriers.length
          ? `<ul>${genotypeCarriers.map((carrier) => `<li>${carrier}</li>`).join("")}</ul>`
          : "<p>None</p>"
      }
    </details>
  `;
}

function findAnimalById(animals: Animal[], id: string | null): Animal | null {
  if (!id) return null;
  return animals.find((animal) => animal.id === id) ?? null;
}

function renderPedigree(
  animal: Animal,
  animals: Animal[],
  depth = 0,
  maxDepth = 3,
): string {
  const indent = "&nbsp;".repeat(depth * 4);
  const label = `${indent}${depth === 0 ? "" : "└─ "}${animal.name} (${animal.speciesId})`;

  if (depth >= maxDepth) {
    return `<div>${label}</div>`;
  }

  const mother = findAnimalById(animals, animal.motherId);
  const father = findAnimalById(animals, animal.fatherId);

  if (!mother && !father) {
    return `<div>${label}</div>`;
  }

  return `
    <div>${label}</div>
    ${
      mother
        ? renderPedigree(mother, animals, depth + 1, maxDepth)
        : `<div>${indent}&nbsp;&nbsp;&nbsp;&nbsp;└─ Unknown mother</div>`
    }
    ${
      father
        ? renderPedigree(father, animals, depth + 1, maxDepth)
        : `<div>${indent}&nbsp;&nbsp;&nbsp;&nbsp;└─ Unknown father</div>`
    }
  `;
}

function renderAnimal(animal: Animal, animals: Animal[]): string {
  return `
    <article>
      <h4>${animal.name} ${getSexSymbol(animal)}</h4>
      <p><strong>ID:</strong> ${animal.id}</p>
      <p><strong>Species ID:</strong> ${animal.speciesId}</p>
      <p><strong>Generation:</strong> ${animal.generation}</p>
      <p><strong>Sex:</strong> ${animal.sex?.phenotypic ?? "unknown"} / ${
        animal.sex?.chromosomal ?? "unknown"
      }</p>
      <p><strong>Reproductive Role:</strong> ${
        animal.sex?.reproductiveRole ?? "unknown"
      }</p>
      <p><strong>Pregnancy:</strong> ${
        animal.reproduction?.pregnant
          ? `Pregnant (${animal.reproduction.gestationProgress}/3) by ${animal.reproduction.currentSireName ?? "Unknown"}`
          : "Not pregnant"
      }</p>
      <p><strong>Overall Health:</strong> ${animal.health?.overallHealth ?? "Unknown"} (${animal.health?.healthGrade ?? "unknown"})</p>
      <p><strong>Genetic Robustness:</strong> ${animal.health?.geneticRobustness ?? "Unknown"}</p>
      <p><strong>Developmental Stability:</strong> ${
        animal.developmentalAnomalyProfile?.developmentalStability ?? "Unknown"
      }</p>
      <p><strong>Developmental Risk:</strong> ${
        animal.developmentalAnomalyProfile?.riskScore ?? "Unknown"
      }</p>
      <p><strong>Inherited Developmental Liability:</strong> ${
        animal.developmentalAnomalyProfile?.inheritedLiability ?? 0
      }</p>
      <p><strong>Generated Anomalies:</strong> ${
        animal.developmentalAnomalyProfile?.anomalies?.length
          ? animal.developmentalAnomalyProfile.anomalies.join(", ")
          : "None"
      }</p>
      <p><strong>Mother:</strong> ${animal.motherName ?? "Founder"}</p>
      <p><strong>Father:</strong> ${animal.fatherName ?? "Founder"}</p>
      <p><strong>Inbreeding Coefficient:</strong> ${animal.inbreedingCoefficient ?? 0}</p>
      <p><strong>Inbreeding Tier:</strong> ${animal.inbreedingTier ?? "none"}</p>
      <p><strong>D Traits:</strong> ${animal.genome.D.length}</p>
      ${renderCarrierSummary(animal)}
      <p><strong>M Mutations:</strong> ${
        animal.genome.M.length ? animal.genome.M.join(", ") : "None"
      }</p>
      <p><strong>Fertility:</strong> ${animal.stats.fertility}</p>
      <p><strong>Stability:</strong> ${animal.stats.stability}</p>
      <p><strong>Lineage:</strong> ${JSON.stringify(animal.genome.L)}</p>
      <p><strong>Founder IDs:</strong> ${
        animal.ancestry?.founderIds?.length
          ? animal.ancestry.founderIds.join(", ")
          : "Unknown"
      }</p>
      <p><strong>Cached Ancestor IDs:</strong> ${
        animal.ancestry?.ancestorIds?.length
          ? animal.ancestry.ancestorIds.join(", ")
          : "None"
      }</p>

      <details>
        <summary>Sex Development</summary>
        ${renderSexDevelopment(animal)}
      </details>

      <details>
        <summary>Health Profile</summary>
        ${renderHealthProfile(animal)}
      </details>

      <details>
        <summary>Developmental Anomaly Profile</summary>
        ${renderDevelopmentalAnomalyProfile(animal)}
      </details>

      <details>
        <summary>Genotype</summary>
        ${renderGenotype(animal.genotype)}
      </details>

      <details>
        <summary>Phenotype</summary>
        <ul>${renderPhenotype(animal.phenotype)}</ul>
      </details>

      <details>
        <summary>Pedigree</summary>
        <div style="font-family: monospace;">
          ${renderPedigree(animal, animals)}
        </div>
      </details>
    </article>
  `;
}

function renderAnimalOptions(animals: Animal[]): string {
  return animals
    .map((animal) => {
      const health = Math.round(
        (animal.health?.overallHealth ?? 0.7) * 100,
      );

      const anomalyFlag =
        animal.developmentalAnomalyProfile?.anomalies?.length
          ? " 🧬"
          : "";

      const idSuffix = animal.id.slice(-5);

      return `
        <option value="${animal.id}">
          ${animal.name}
          ${getSexSymbol(animal)}
          [${idSuffix}]
          H:${health}
          ${anomalyFlag}
          — ${animal.speciesId}
        </option>
      `;
    })
    .join("");
}

function getUniqueSpecies(animals: Animal[]): string[] {
  return Array.from(new Set(animals.map((animal) => animal.speciesId))).sort();
}

function getUniqueGenerations(animals: Animal[]): number[] {
  return Array.from(new Set(animals.map((animal) => animal.generation))).sort(
    (a, b) => a - b,
  );
}

function applyKennelFilters(
  animals: Animal[],
  filters: KennelFilters,
): Animal[] {
  let result = [...animals];

  const search = filters.search.trim().toLowerCase();

  if (search) {
    result = result.filter(
      (animal) =>
        animal.name.toLowerCase().includes(search) ||
        animal.speciesId.toLowerCase().includes(search) ||
        animal.id.toLowerCase().includes(search) ||
        (animal.inbreedingTier ?? "none").toLowerCase().includes(search) ||
        (animal.sex?.reproductiveRole ?? "").toLowerCase().includes(search) ||
        (animal.health?.healthGrade ?? "").toLowerCase().includes(search) ||
        (animal.developmentalAnomalyProfile?.anomalies ?? []).some(
          (anomalyId) => anomalyId.toLowerCase().includes(search),
        ),
    );
  }

  if (filters.species !== "all") {
    result = result.filter((animal) => animal.speciesId === filters.species);
  }

  if (filters.generation !== "all") {
    const generation = Number(filters.generation);
    result = result.filter((animal) => animal.generation === generation);
  }

  result.sort((a, b) => {
    if (filters.sort === "generation") return b.generation - a.generation;
    if (filters.sort === "fertility")
      return b.stats.fertility - a.stats.fertility;
    if (filters.sort === "stability")
      return b.stats.stability - a.stats.stability;
    if (filters.sort === "mutations")
      return b.genome.M.length - a.genome.M.length;
    return a.name.localeCompare(b.name);
  });

  return result;
}

function renderSpeciesFilterOptions(
  animals: Animal[],
  selected: string,
): string {
  return [
    `<option value="all" ${selected === "all" ? "selected" : ""}>All Species</option>`,
    ...getUniqueSpecies(animals).map(
      (speciesId) =>
        `<option value="${speciesId}" ${
          selected === speciesId ? "selected" : ""
        }>${speciesId}</option>`,
    ),
  ].join("");
}

function renderGenerationFilterOptions(
  animals: Animal[],
  selected: string,
): string {
  return [
    `<option value="all" ${selected === "all" ? "selected" : ""}>All Generations</option>`,
    ...getUniqueGenerations(animals).map(
      (generation) =>
        `<option value="${generation}" ${
          selected === String(generation) ? "selected" : ""
        }>Generation ${generation}</option>`,
    ),
  ].join("");
}

function renderApp(
  species: any,
  traits: any,
  breedingRules: any,
  mutations: any,
  loci: any,
  speciesGenotypes: any,
  phenotypeRules: any,
  animals: Animal[],
  latestOffspring: Animal | null = null,
  latestCompatibility: any = null,
  selectedMode: BreedMode = "realistic",
  saveStatus = "Loaded.",
  filters: KennelFilters = DEFAULT_FILTERS,
) {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    document.body.innerHTML = "<h1>Error: #app not found</h1>";
    return;
  }

  const activeFilters = filters ?? DEFAULT_FILTERS;
  const visibleAnimals = applyKennelFilters(animals, activeFilters);

  app.innerHTML = `
    <h1>Canidae: Lineages</h1>
    <h2>Phase 1D.2a/1D.3 - Extinct Reconstruction / Anomaly Generation</h2>

    <section>
      <p><strong>Species Loaded:</strong> ${species.canids?.length ?? "Unknown"}</p>
      <p><strong>Trait Categories:</strong> ${Object.keys(traits.categories ?? {}).length}</p>
      <p><strong>Breeding Rules:</strong> ${breedingRules ? "Loaded" : "Missing"}</p>
      <p><strong>Mutation Catalog:</strong> ${
        mutations.mutations?.length ?? "Unknown"
      } mutations loaded</p>
      <p><strong>Loci Loaded:</strong> ${Object.keys(loci.loci ?? {}).length}</p>
      <p><strong>Species Genotype Templates:</strong> ${
        Object.keys(speciesGenotypes.founderGenotypes ?? {}).length
      }</p>
      <p><strong>Phenotype Rules:</strong> ${
        phenotypeRules.rules?.length ?? 0
      }</p>
      <p><strong>Animals in Kennel:</strong> ${animals.length}</p>
      <p><strong>Visible Animals:</strong> ${visibleAnimals.length}</p>
      <p><strong>Save Status:</strong> ${saveStatus}</p>
    </section>

    ${renderPopulationStats(animals)}

    <section>
      <button id="saveButton">Save Kennel</button>
      <button id="resetButton">Reset Save</button>
      <button id="advanceGestationButton">Advance Gestation</button>
      <button id="birthReadyLittersButton">Birth Ready Litters</button>
    </section>

    <hr />

    <section>
      <h3>Breeding Lab</h3>

      <label for="parentA">Selected Animal A</label><br />
      <select id="parentA">${renderAnimalOptions(animals)}</select>

      <br /><br />

      <label for="parentB">Selected Animal B</label><br />
      <select id="parentB">${renderAnimalOptions(animals)}</select>

      <br /><br />

      <label for="mode">Mode</label><br />
      <select id="mode">
        <option value="realistic" ${selectedMode === "realistic" ? "selected" : ""}>Realistic</option>
        <option value="sandbox" ${selectedMode === "sandbox" ? "selected" : ""}>Sandbox</option>
      </select>

      <br /><br />

      <button id="breedButton">Start Pregnancy</button>

      <hr />

      <h4>Population Test Preview</h4>
      <label for="populationTestTarget">Target Births</label><br />
      <input id="populationTestTarget" type="number" min="1" max="250" value="50" />

      <br /><br />

      <button id="populationTestButton">Run Population Test Preview</button>
      <button id="exportPopulationReportButton">Export Current Report (.md)</button>

      <br /><br />

      <button id="standardSuiteButton">Run Standard Founder Test Suite</button>
      <button id="exportSuiteSummaryButton">Export Suite Summary (.md)</button>
      <button id="exportSuiteJsonButton">Export Suite JSON (.md)</button>

      <p><small>Population tests and suites do not save generated test offspring to the kennel.</small></p>
    </section>

    <hr />

    <section>
      <h3>Kennel Management</h3>

      <label for="searchInput">Search</label><br />
      <input id="searchInput" type="text" value="${activeFilters.search}" placeholder="Search name, species, ID, role, health grade, or inbreeding tier" />

      <br /><br />

      <label for="speciesFilter">Species</label><br />
      <select id="speciesFilter">
        ${renderSpeciesFilterOptions(animals, activeFilters.species)}
      </select>

      <br /><br />

      <label for="generationFilter">Generation</label><br />
      <select id="generationFilter">
        ${renderGenerationFilterOptions(animals, activeFilters.generation)}
      </select>

      <br /><br />

      <label for="sortFilter">Sort</label><br />
      <select id="sortFilter">
        <option value="name" ${activeFilters.sort === "name" ? "selected" : ""}>Name A-Z</option>
        <option value="generation" ${activeFilters.sort === "generation" ? "selected" : ""}>Generation High-Low</option>
        <option value="fertility" ${activeFilters.sort === "fertility" ? "selected" : ""}>Fertility High-Low</option>
        <option value="stability" ${activeFilters.sort === "stability" ? "selected" : ""}>Stability High-Low</option>
        <option value="mutations" ${activeFilters.sort === "mutations" ? "selected" : ""}>Mutation Count High-Low</option>
      </select>

      <br /><br />

      <button id="applyFiltersButton">Apply Filters</button>
      <button id="clearFiltersButton">Clear Filters</button>
    </section>

    <section>
      <h3>View Controls</h3>
      <button id="expandAllDetailsButton">Expand All Details</button>
      <button id="collapseAllDetailsButton">Collapse All Details</button>
    </section>

    <hr />

    <section>
      <h3>Latest Pregnancy / Birth / Validation Info</h3>
      <pre>${JSON.stringify(latestCompatibility, null, 2)}</pre>
    </section>

    <section>
      <h3>Population Test Preview Report</h3>
      ${renderPopulationTestReport(
        latestCompatibility?.action === "population_test_preview"
          ? latestCompatibility
          : null,
      )}
    </section>

    <section>
      <h3>Latest Born Offspring</h3>
      ${latestOffspring ? renderAnimal(latestOffspring, animals) : "<p>No offspring born yet.</p>"}
    </section>

    <hr />

    <section>
      <h3>Kennel</h3>
      ${visibleAnimals.map((animal) => renderAnimal(animal, animals)).join("")}
    </section>
  `;

  const parentASelect = document.querySelector<HTMLSelectElement>("#parentA");
  const parentBSelect = document.querySelector<HTMLSelectElement>("#parentB");
  const modeSelect = document.querySelector<HTMLSelectElement>("#mode");
  const breedButton = document.querySelector<HTMLButtonElement>("#breedButton");
  const populationTestTarget =
    document.querySelector<HTMLInputElement>("#populationTestTarget");
  const populationTestButton = document.querySelector<HTMLButtonElement>(
    "#populationTestButton",
  );
  const exportPopulationReportButton =
    document.querySelector<HTMLButtonElement>("#exportPopulationReportButton");
  const standardSuiteButton =
    document.querySelector<HTMLButtonElement>("#standardSuiteButton");
  const exportSuiteSummaryButton =
    document.querySelector<HTMLButtonElement>("#exportSuiteSummaryButton");
  const exportSuiteJsonButton =
    document.querySelector<HTMLButtonElement>("#exportSuiteJsonButton");
  const saveButton = document.querySelector<HTMLButtonElement>("#saveButton");
  const resetButton = document.querySelector<HTMLButtonElement>("#resetButton");
  const advanceGestationButton = document.querySelector<HTMLButtonElement>(
    "#advanceGestationButton",
  );
  const birthReadyLittersButton = document.querySelector<HTMLButtonElement>(
    "#birthReadyLittersButton",
  );

  const searchInput = document.querySelector<HTMLInputElement>("#searchInput");
  const speciesFilter =
    document.querySelector<HTMLSelectElement>("#speciesFilter");
  const generationFilter =
    document.querySelector<HTMLSelectElement>("#generationFilter");
  const sortFilter = document.querySelector<HTMLSelectElement>("#sortFilter");
  const applyFiltersButton = document.querySelector<HTMLButtonElement>(
    "#applyFiltersButton",
  );
  const clearFiltersButton = document.querySelector<HTMLButtonElement>(
    "#clearFiltersButton",
  );
  const expandAllDetailsButton = document.querySelector<HTMLButtonElement>(
    "#expandAllDetailsButton",
  );
  const collapseAllDetailsButton = document.querySelector<HTMLButtonElement>(
    "#collapseAllDetailsButton",
  );

  if (
    !parentASelect ||
    !parentBSelect ||
    !modeSelect ||
    !breedButton ||
    !populationTestTarget ||
    !populationTestButton ||
    !exportPopulationReportButton ||
    !standardSuiteButton ||
    !exportSuiteSummaryButton ||
    !exportSuiteJsonButton ||
    !saveButton ||
    !resetButton ||
    !advanceGestationButton ||
    !birthReadyLittersButton ||
    !searchInput ||
    !speciesFilter ||
    !generationFilter ||
    !sortFilter ||
    !applyFiltersButton ||
    !clearFiltersButton ||
    !expandAllDetailsButton ||
    !collapseAllDetailsButton
  ) {
    return;
  }

  if (animals[0]) parentASelect.value = animals[0].id;
  if (animals[1]) parentBSelect.value = animals[1].id;
  modeSelect.value = selectedMode;

  saveButton.addEventListener("click", () => {
    saveAnimals(animals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      animals,
      latestOffspring,
      latestCompatibility,
      selectedMode,
      "Kennel saved.",
      activeFilters,
    );
  });

  resetButton.addEventListener("click", () => {
    clearSave();

    const resetAnimals = createFounderAnimals(
      species,
      speciesGenotypes,
      phenotypeRules,
    );

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      resetAnimals,
      null,
      null,
      "realistic",
      "Save reset. Founder kennel restored.",
      DEFAULT_FILTERS,
    );
  });

  advanceGestationButton.addEventListener("click", () => {
    const advancedAnimals = animals.map(advancePregnancy);
    saveAnimals(advancedAnimals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      advancedAnimals,
      latestOffspring,
      {
        action: "advance_gestation",
        pregnantAnimals: advancedAnimals.filter(
          (animal) => animal.reproduction.pregnant,
        ).length,
        birthReadyAnimals: advancedAnimals.filter(isReadyToGiveBirth).length,
      },
      selectedMode,
      "Gestation advanced by 1 step.",
      activeFilters,
    );
  });

  birthReadyLittersButton.addEventListener("click", () => {
    let updatedAnimals = [...animals];
    const newPups: Animal[] = [];
    const birthReports: any[] = [];

    for (const dam of animals.filter(isReadyToGiveBirth)) {
      const sire = findAnimalById(
        updatedAnimals,
        dam.reproduction.currentSireId,
      );

      if (!sire) {
        continue;
      }

      const compatibility = resolveCompatibility(dam, sire, species);
      const inbreeding = calculateInbreeding(dam, sire, updatedAnimals);

      const litter = createLitter(
        dam,
        sire,
        compatibility,
        mutations,
        updatedAnimals,
        phenotypeRules,
      );

      newPups.push(...litter);

      birthReports.push({
        dam: dam.name,
        sire: sire.name,
        litterSize: litter.length,
        compatibility,
        inbreeding,
      });

      updatedAnimals = updatedAnimals.map((animal) =>
        animal.id === dam.id ? clearPregnancyAfterBirth(animal) : animal,
      );

      updatedAnimals.push(...litter);
    }

    saveAnimals(updatedAnimals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      updatedAnimals,
      newPups[newPups.length - 1] ?? null,
      {
        action: "birth_ready_litters",
        littersBorn: birthReports.length,
        pupsBorn: newPups.length,
        reports: birthReports,
      },
      selectedMode,
      birthReports.length
        ? `${birthReports.length} litter(s) born. ${newPups.length} pup(s) added.`
        : "No animals were ready to give birth.",
      activeFilters,
    );
  });

  applyFiltersButton.addEventListener("click", () => {
    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      animals,
      latestOffspring,
      latestCompatibility,
      selectedMode,
      saveStatus,
      {
        search: searchInput.value,
        species: speciesFilter.value,
        generation: generationFilter.value,
        sort: sortFilter.value as SortMode,
      },
    );
  });

  clearFiltersButton.addEventListener("click", () => {
    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      animals,
      latestOffspring,
      latestCompatibility,
      selectedMode,
      saveStatus,
      DEFAULT_FILTERS,
    );
  });

  expandAllDetailsButton.addEventListener("click", () => {
    document.querySelectorAll("details").forEach((element) => {
      (element as HTMLDetailsElement).open = true;
    });
  });

  collapseAllDetailsButton.addEventListener("click", () => {
    document.querySelectorAll("details").forEach((element) => {
      (element as HTMLDetailsElement).open = false;
    });
  });

  exportPopulationReportButton.addEventListener("click", () => {
    if (latestCompatibility?.action !== "population_test_preview") {
      window.alert("Run a Population Test Preview first.");
      return;
    }

    downloadTextFile(
      createPopulationReportFilename(latestCompatibility),
      createPopulationReportMarkdown(latestCompatibility),
    );
  });

  standardSuiteButton.addEventListener("click", () => {
    const suite = runStandardFounderSuite(
      species,
      mutations,
      animals,
      phenotypeRules,
      Number(populationTestTarget.value || 50),
    );

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      animals,
      null,
      suite,
      "sandbox",
      `Standard founder suite generated ${suite.reports?.length ?? 0} population test report(s). Kennel not saved.`,
      activeFilters,
    );
  });

  exportSuiteSummaryButton.addEventListener("click", () => {
    if (latestCompatibility?.action !== "standard_founder_suite") {
      window.alert("Run the Standard Founder Test Suite first.");
      return;
    }

    downloadTextFile(
      "suite-summary-standard-founder-population-tests.md",
      createSuiteSummaryMarkdown(latestCompatibility),
    );
  });

  exportSuiteJsonButton.addEventListener("click", () => {
    if (latestCompatibility?.action !== "standard_founder_suite") {
      window.alert("Run the Standard Founder Test Suite first.");
      return;
    }

    downloadTextFile(
      "suite-raw-json-standard-founder-population-tests.md",
      createSuiteJsonMarkdown(latestCompatibility),
    );
  });

  populationTestButton.addEventListener("click", () => {
    const selectedA = animals.find(
      (animal) => animal.id === parentASelect.value,
    );
    const selectedB = animals.find(
      (animal) => animal.id === parentBSelect.value,
    );
    const mode = modeSelect.value as BreedMode;

    if (!selectedA || !selectedB) return;

    const result = runPopulationTest(
      selectedA,
      selectedB,
      mode,
      species,
      mutations,
      animals,
      phenotypeRules,
      Number(populationTestTarget.value || 50),
    );

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      animals,
      result.latestTestOffspring,
      result.report,
      mode,
      `Population test preview generated ${result.report.birthsGenerated ?? 0} simulated birth(s). Kennel not saved.`,
      activeFilters,
    );
  });

  breedButton.addEventListener("click", () => {
    const selectedA = animals.find(
      (animal) => animal.id === parentASelect.value,
    );
    const selectedB = animals.find(
      (animal) => animal.id === parentBSelect.value,
    );
    const mode = modeSelect.value as BreedMode;

    if (!selectedA || !selectedB) return;

    const roleResult = resolveBreedingRoles(selectedA, selectedB, mode);

    if (roleResult.blocked) {
      renderApp(
        species,
        traits,
        breedingRules,
        mutations,
        loci,
        speciesGenotypes,
        phenotypeRules,
        animals,
        null,
        {
          blocked: true,
          blockedReason: roleResult.reason,
          selectedA: {
            name: selectedA.name,
            role: selectedA.sex?.reproductiveRole,
            chromosomal: selectedA.sex?.chromosomal,
          },
          selectedB: {
            name: selectedB.name,
            role: selectedB.sex?.reproductiveRole,
            chromosomal: selectedB.sex?.chromosomal,
          },
        },
        mode,
        saveStatus,
        activeFilters,
      );
      return;
    }

    if (!canBecomePregnant(roleResult.dam)) {
      renderApp(
        species,
        traits,
        breedingRules,
        mutations,
        loci,
        speciesGenotypes,
        phenotypeRules,
        animals,
        null,
        {
          blocked: true,
          blockedReason: `${roleResult.dam.name} cannot start a new pregnancy right now.`,
          dam: roleResult.dam.name,
          pregnant: roleResult.dam.reproduction.pregnant,
        },
        mode,
        saveStatus,
        activeFilters,
      );
      return;
    }

    const compatibility = resolveCompatibility(
      roleResult.dam,
      roleResult.sire,
      species,
    );
    const inbreeding = calculateInbreeding(
      roleResult.dam,
      roleResult.sire,
      animals,
    );

    if (mode === "realistic" && !compatibility.realisticAllowed) {
      renderApp(
        species,
        traits,
        breedingRules,
        mutations,
        loci,
        speciesGenotypes,
        phenotypeRules,
        animals,
        null,
        {
          ...compatibility,
          inbreeding,
          breedingRoles: {
            dam: roleResult.dam.name,
            sire: roleResult.sire.name,
          },
          blocked: true,
          blockedReason:
            "This pairing is blocked in Realistic Mode. Try Sandbox Mode.",
        },
        mode,
        saveStatus,
        activeFilters,
      );
      return;
    }

    const updatedAnimals = animals.map((animal) =>
      animal.id === roleResult.dam.id
        ? startPregnancy(animal, roleResult.sire)
        : animal,
    );

    saveAnimals(updatedAnimals);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      updatedAnimals,
      null,
      {
        action: "pregnancy_started",
        dam: roleResult.dam.name,
        sire: roleResult.sire.name,
        compatibility,
        inbreeding,
        gestationRequired: 3,
      },
      mode,
      `${roleResult.dam.name} is now pregnant by ${roleResult.sire.name}.`,
      activeFilters,
    );
  });
}

async function bootstrap() {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    document.body.innerHTML = "<h1>Error: #app not found</h1>";
    return;
  }

  app.innerHTML = "<h1>Loading Canidae: Lineages...</h1>";

  try {
    const [
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
    ] = await Promise.all([
      loadJson("/data/canid_compendium_starter.json"),
      loadJson("/data/trait_library_starter.json"),
      loadJson("/data/breeding_rules_starter.json"),
      loadJson("/data/MUTATION_CATALOG_V1.json"),
      loadJson("/data/genetics/loci.json"),
      loadJson("/data/genetics/species_genotypes.json"),
      loadJson("/data/genetics/phenotype_rules.json"),
    ]);

    const savedAnimals = loadSavedAnimals();
    const animals =
      savedAnimals ??
      createFounderAnimals(species, speciesGenotypes, phenotypeRules);

    renderApp(
      species,
      traits,
      breedingRules,
      mutations,
      loci,
      speciesGenotypes,
      phenotypeRules,
      animals,
      null,
      null,
      "realistic",
      "Loaded.",
      DEFAULT_FILTERS,
    );
  } catch (error) {
    app.innerHTML = `
      <h1>Canidae: Lineages</h1>
      <h2>Error</h2>
      <pre>${String(error)}</pre>
    `;

    console.error(error);
  }
}

bootstrap();
