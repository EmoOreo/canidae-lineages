export interface SpeciesTemplate {
  id: string;
  commonName: string;
  scientificName: string;
  status: string;
  taxonomy: {
    family: string;
    subfamily: string;
    tribe: string;
    genus: string;
  };
  compatibilityGroup: string;
  modelArchetype: string;
}

export interface TraitLibrary {
  trait_library: Record<string, unknown>;
}

export interface BreedingRules {
  compatibilityTiers?: unknown[];
}

export interface MutationCatalog {
  mutations?: unknown[];
}

export interface GameData {
  species: unknown;
  traits: unknown;
  breedingRules: unknown;
  mutations: unknown;
}