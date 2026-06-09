import type { Animal } from "../types/animal";

export function canBecomePregnant(animal: Animal): boolean {
  return animal.sex?.reproductiveRole === "dam" && !animal.reproduction.pregnant;
}

export function startPregnancy(dam: Animal, sire: Animal): Animal {
  return {
    ...dam,
    reproduction: {
      ...dam.reproduction,
      pregnant: true,
      gestationProgress: 0,
      currentSireId: sire.id,
      currentSireName: sire.name,
    },
  };
}

export function advancePregnancy(animal: Animal): Animal {
  if (!animal.reproduction.pregnant) {
    return animal;
  }

  return {
    ...animal,
    reproduction: {
      ...animal.reproduction,
      gestationProgress: animal.reproduction.gestationProgress + 1,
    },
  };
}

export function clearPregnancyAfterBirth(animal: Animal): Animal {
  return {
    ...animal,
    reproduction: {
      ...animal.reproduction,
      pregnant: false,
      gestationProgress: 0,
      litterCount: animal.reproduction.litterCount + 1,
      currentSireId: null,
      currentSireName: null,
    },
  };
}

export function isReadyToGiveBirth(animal: Animal): boolean {
  return animal.reproduction.pregnant && animal.reproduction.gestationProgress >= 3;
}