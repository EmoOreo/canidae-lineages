import { GameData } from "../types/genetics";

export async function loadGameData(): Promise<GameData> {
  const [
    species,
    traits,
    breedingRules,
    mutations
  ] = await Promise.all([
    fetch("/data/canid_compendium_starter.json").then(r => r.json()),
    fetch("/data/trait_library_starter.json").then(r => r.json()),
    fetch("/data/breeding_rules_starter.json").then(r => r.json()),
    fetch("/data/MUTATION_CATALOG_V1.json").then(r => r.json())
  ]);

  return {
    species,
    traits,
    breedingRules,
    mutations
  };
}