import type { Animal } from "../types/animal";

export function createFounderAnimals(speciesData: any): Animal[] {
  const starterSpecies = [
    "canis_lupus_familiaris",
    "canis_lupus",
    "canis_latrans",
    "vulpes_vulpes",
    "vulpes_zerda",
    "aenocyon_dirus"
  ];

  return starterSpecies
    .map((id) =>
      speciesData.canids.find((c: any) => c.id === id)
    )
    .filter(Boolean)
    .map((species: any, index: number): Animal => ({
      id: `founder_${index}`,
      name: `${species.commonName} Alpha`,
      speciesId: species.id,

      generation: 0,

      genome: {
        D: [],
        R: [],
        M: [],
        L: {
          [species.id]: 100
        }
      },

      stats: {
        fertility: species.fertilityBaseline ?? 50,
        stability: 100
      }
    }));
}