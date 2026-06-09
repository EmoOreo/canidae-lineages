import type { Animal, SexDevelopment, TraitValue } from "../types/animal";
import { createFounderGenotype } from "./genotypeEngine";
import { evaluatePhenotypeFromGenotype } from "./phenotypeEngine";
import { normalizeCarriers } from "./normalizeCarriers";
import { createFounderHealthProfile } from "./healthEngine";
import { createFounderDevelopmentalAnomalyProfile } from "./developmentalAnomalyEngine";

function normalizeBodySize(species: any): number {
  const maxMass = species.bodyMassKg?.max ?? 50;
  return Math.max(0.1, Math.min(1, maxMass / 100));
}

function normalizeLegLength(species: any): number {
  const height = species.shoulderHeightCm?.max ?? 50;
  return Math.max(0.4, Math.min(1, height / 100));
}

function inferEarType(species: any): string {
  const ear = String(species.earType ?? "").toLowerCase();

  if (ear.includes("large")) return "erect_large";
  if (ear.includes("small") || ear.includes("rounded")) return "erect_small";
  if (ear.includes("floppy")) return "floppy";

  return "erect_medium";
}

function inferTailType(species: any): string {
  const tail = String(species.tailType ?? "").toLowerCase();

  if (tail.includes("short")) return "bushy_short";
  if (tail.includes("thin")) return "thin_long";
  if (tail.includes("curled")) return "curled";

  return "bushy_long";
}

function inferCoatLength(species: any): string {
  const coat = String(species.coatType ?? "").toLowerCase();

  if (coat.includes("dense") || coat.includes("double")) return "double_dense";
  if (coat.includes("short")) return "short";
  if (coat.includes("long")) return "long";

  return "medium";
}

function inferBaseCoatColor(species: any): string {
  const colors = species.defaultCoatColors ?? [];

  if (!Array.isArray(colors) || colors.length === 0) {
    return "agouti";
  }

  const first = String(colors[0]).toLowerCase();

  if (first.includes("black")) return "black";
  if (first.includes("white")) return "white";
  if (first.includes("cream")) return "cream";
  if (first.includes("red")) return "red_orange";
  if (first.includes("yellow") || first.includes("gold")) return "golden_yellow";
  if (first.includes("sand")) return "sandy";
  if (first.includes("brown")) return "brown";
  if (first.includes("gray") || first.includes("grey")) return "gray";

  return "agouti";
}

function createFounderBasePhenotype(species: any): Record<string, TraitValue> {
  return {
    trait_body_size: normalizeBodySize(species),
    trait_leg_length: normalizeLegLength(species),
    trait_skull_robustness:
      species.skullType === "bone_crushing" || species.skullType === "robust"
        ? 0.9
        : 0.55,
    trait_muzzle_length:
      species.muzzleLength === "long"
        ? 0.85
        : species.muzzleLength === "short"
          ? 0.35
          : 0.6,
    trait_ear_type: inferEarType(species),
    trait_tail_type: inferTailType(species),
    trait_body_mass_modifier: 1.0,

    trait_coat_length: inferCoatLength(species),
    trait_base_coat_color: inferBaseCoatColor(species),
    trait_coat_pattern: "solid",
    trait_seasonal_coat:
      (species.climateTolerance ?? []).includes("arctic") ||
      (species.climateTolerance ?? []).includes("subarctic"),
    trait_coat_texture: "coarse",

    trait_temperament: species.temperamentBaseline ?? 0.5,
    trait_prey_drive: species.preyDriveBaseline ?? 0.7,
    trait_pack_bonding: species.sociality === "highly_social" ? 0.9 : 0.5,
    trait_trainability: species.trainabilityBaseline ?? 0.4,
    trait_vocalization: species.id === "canis_lupus_familiaris" ? "bark" : "howl",

    trait_climate_tolerance: species.climateTolerance ?? [],
    trait_diet_specialism: species.dietSpecialization ?? "carnivore",
    trait_habitat_preference: species.habitats ?? [],

    trait_immune_vigor: 0.75,
    trait_lifespan_potential: 0.65,
    trait_inbreeding_coefficient: 0,
    trait_genetic_stability: 1,

    trait_fertility_rate: species.fertilityBaseline ?? 0.75,
    trait_litter_size_potential: 4,
    trait_sterility_risk: 0,

    trait_mutation_rate: 0.05,
    trait_dna_completeness: species.status === "extinct" ? 0.75 : 1,
  };
}

function createFounderRecessiveCarriers(species: any): string[] {
  const carriers: string[] = [];

  if (species.id === "canis_lupus_familiaris") {
    carriers.push("trait_ear_type:floppy");
    carriers.push("trait_tail_type:bobtail");
    carriers.push("trait_coat_length:long");
    carriers.push("trait_base_coat_color:white");
  }

  if (species.id === "canis_lupus") {
    carriers.push("trait_base_coat_color:white");
    carriers.push("trait_coat_length:long");
    carriers.push("trait_tail_type:bushy_short");
  }

  if (species.id === "canis_latrans") {
    carriers.push("trait_base_coat_color:sandy");
    carriers.push("trait_coat_pattern:masked");
    carriers.push("trait_tail_type:bushy_short");
  }

  if (species.id === "vulpes_vulpes") {
    carriers.push("trait_base_coat_color:black");
    carriers.push("trait_coat_pattern:piebald");
    carriers.push("trait_coat_texture:silky");
  }

  if (species.id === "vulpes_zerda") {
    carriers.push("trait_ear_type:erect_large");
    carriers.push("trait_base_coat_color:cream");
    carriers.push("trait_body_size:0.18");
  }

  if (species.id === "aenocyon_dirus") {
    carriers.push("trait_skull_robustness:0.95");
    carriers.push("trait_body_size:0.95");
    carriers.push("trait_base_coat_color:gray");
  }

  return normalizeCarriers(carriers);
}

function getStableFounderId(speciesId: string): string {
  const stableIds: Record<string, string> = {
    canis_lupus_familiaris: "founder_domestic_dog_alpha",
    canis_lupus: "founder_gray_wolf_alpha",
    canis_latrans: "founder_coyote_alpha",
    vulpes_vulpes: "founder_red_fox_alpha",
    vulpes_zerda: "founder_fennec_fox_alpha",
    aenocyon_dirus: "founder_dire_wolf_alpha",
  };

  return stableIds[speciesId] ?? `founder_${speciesId}`;
}

function createSexDevelopment(role: "dam" | "sire"): SexDevelopment {
  if (role === "dam") {
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

function getFounderReproductiveRole(speciesId: string): "dam" | "sire" {
  const roleMap: Record<string, "dam" | "sire"> = {
    canis_lupus_familiaris: "dam",
    canis_lupus: "sire",
    canis_latrans: "dam",
    vulpes_vulpes: "sire",
    vulpes_zerda: "dam",
    aenocyon_dirus: "sire",
  };

  return roleMap[speciesId] ?? (Math.random() < 0.5 ? "dam" : "sire");
}

export function createFounderAnimals(
  speciesData: any,
  speciesGenotypesData: any,
  phenotypeRulesData: any
): Animal[] {
  const starterSpecies = [
    "canis_lupus_familiaris",
    "canis_lupus",
    "canis_latrans",
    "vulpes_vulpes",
    "vulpes_zerda",
    "aenocyon_dirus",
  ];

  return starterSpecies
    .map((id) => speciesData.canids.find((canid: any) => canid.id === id))
    .filter(Boolean)
    .map((species: any): Animal => {
      const genotype = createFounderGenotype(species, speciesGenotypesData);
      const basePhenotype = createFounderBasePhenotype(species);
      const phenotype = evaluatePhenotypeFromGenotype(
        genotype,
        basePhenotype,
        phenotypeRulesData
      );
      const recessiveCarriers = createFounderRecessiveCarriers(species);
      const health = createFounderHealthProfile(species);
      const developmentalAnomalyProfile = createFounderDevelopmentalAnomalyProfile(species);

      const id = getStableFounderId(species.id);
      const reproductiveRole = getFounderReproductiveRole(species.id);

      return {
        id,
        name: `${species.commonName} Alpha`,
        speciesId: species.id,
        generation: 0,

        motherId: null,
        fatherId: null,
        motherName: null,
        fatherName: null,

        sex: createSexDevelopment(reproductiveRole),

        reproduction: {
          pregnant: false,
          gestationProgress: 0,
          litterCount: 0,
          currentSireId: null,
          currentSireName: null,
        },

        health,
        developmentalAnomalyProfile,

        inbreedingCoefficient: 0,
        inbreedingTier: "none",

        genotype,
        phenotype,

        ancestry: {
          parentIds: [],
          founderIds: [id],
          ancestorIds: [],
          lineage: {
            [species.id]: 100,
          },
        },

        genome: {
          D: Object.keys(phenotype),
          R: recessiveCarriers,
          M: [],
          L: {
            [species.id]: 100,
          },
        },

        stats: {
          fertility: species.fertilityBaseline ?? 0.75,
          stability: 100,
        },
      };
    });
}
