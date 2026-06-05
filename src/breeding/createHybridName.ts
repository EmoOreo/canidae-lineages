import type { Animal } from "../types/animal";

function getPrimaryLineage(animal: Animal): string {
  return Object.entries(animal.genome.L).sort((a, b) => b[1] - a[1])[0][0];
}

function sortPair(a: string, b: string): string {
  return [a, b].sort().join("|");
}

export function createHybridName(parentA: Animal, parentB: Animal): string {
  const lineageA = getPrimaryLineage(parentA);
  const lineageB = getPrimaryLineage(parentB);

  if (lineageA === lineageB) {
    return `${parentA.name.split(" Alpha")[0]} Line`;
  }

  const pair = sortPair(lineageA, lineageB);

  const knownHybridNames: Record<string, string> = {
    [sortPair("canis_lupus", "canis_latrans")]: "Coywolf",
    [sortPair("canis_lupus", "canis_lupus_familiaris")]: "Wolfdog",
    [sortPair("canis_latrans", "canis_lupus_familiaris")]: "Coydog",
    [sortPair("canis_lupus", "aenocyon_dirus")]: "Direwolf Hybrid",
    [sortPair("canis_latrans", "aenocyon_dirus")]: "Dire-Coyote Hybrid",
    [sortPair("vulpes_vulpes", "vulpes_zerda")]: "Foxline Hybrid",
    [sortPair("canis_lupus", "vulpes_vulpes")]: "Wolf-Fox Experimental",
    [sortPair("canis_lupus", "vulpes_zerda")]: "Wolf-Fennec Experimental",
    [sortPair("aenocyon_dirus", "vulpes_vulpes")]: "Ancient Fox Hybrid",
    [sortPair("aenocyon_dirus", "vulpes_zerda")]: "Ancient Fennec Hybrid",
  };

  return knownHybridNames[pair] ?? "Hybrid";
}