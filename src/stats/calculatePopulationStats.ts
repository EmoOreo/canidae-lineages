import type { Animal } from "../types/animal";

export interface PopulationStats {
  populationSize: number;
  speciesRepresented: number;
  averageFertility: number;
  averageStability: number;
  highestInbreedingCoefficient: number;
  highestInbreedingAnimalName: string;
  mutationCount: number;
  mostCommonFounderId: string;
  mostCommonFounderCount: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculatePopulationStats(animals: Animal[]): PopulationStats {
  if (animals.length === 0) {
    return {
      populationSize: 0,
      speciesRepresented: 0,
      averageFertility: 0,
      averageStability: 0,
      highestInbreedingCoefficient: 0,
      highestInbreedingAnimalName: "None",
      mutationCount: 0,
      mostCommonFounderId: "None",
      mostCommonFounderCount: 0,
    };
  }

  const speciesRepresented = new Set(animals.map((animal) => animal.speciesId)).size;

  const averageFertility =
    animals.reduce((sum, animal) => sum + animal.stats.fertility, 0) / animals.length;

  const averageStability =
    animals.reduce((sum, animal) => sum + animal.stats.stability, 0) / animals.length;

  const highestInbreedingAnimal = animals.reduce((highest, animal) =>
    (animal.inbreedingCoefficient ?? 0) > (highest.inbreedingCoefficient ?? 0)
      ? animal
      : highest
  );

  const mutationCount = animals.reduce(
    (sum, animal) => sum + (animal.genome.M?.length ?? 0),
    0
  );

  const founderCounts = new Map<string, number>();

  for (const animal of animals) {
    for (const founderId of animal.ancestry?.founderIds ?? []) {
      founderCounts.set(founderId, (founderCounts.get(founderId) ?? 0) + 1);
    }
  }

  let mostCommonFounderId = "None";
  let mostCommonFounderCount = 0;

  for (const [founderId, count] of founderCounts.entries()) {
    if (count > mostCommonFounderCount) {
      mostCommonFounderId = founderId;
      mostCommonFounderCount = count;
    }
  }

  return {
    populationSize: animals.length,
    speciesRepresented,
    averageFertility: round(averageFertility),
    averageStability: round(averageStability),
    highestInbreedingCoefficient: highestInbreedingAnimal.inbreedingCoefficient ?? 0,
    highestInbreedingAnimalName: highestInbreedingAnimal.name,
    mutationCount,
    mostCommonFounderId,
    mostCommonFounderCount,
  };
}