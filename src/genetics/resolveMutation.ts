export interface MutationResult {
  mutationId: string | null;
  mutationName: string | null;
  mutationApplied: boolean;
}

export function resolveMutation(
  compatibility: number,
  mutationModifier: number,
  mutationData: any
): MutationResult {
  const mutationList = mutationData.mutations ?? [];

  if (mutationList.length === 0) {
    return {
      mutationId: null,
      mutationName: null,
      mutationApplied: false,
    };
  }

  const baseChance = 0.05;

  const mutationChance =
    baseChance +
    ((1 - compatibility) * 0.25 * mutationModifier);

  const roll = Math.random();

  if (roll > mutationChance) {
    return {
      mutationId: null,
      mutationName: null,
      mutationApplied: false,
    };
  }

  const randomMutation =
    mutationList[
      Math.floor(Math.random() * mutationList.length)
    ];

  return {
    mutationId:
      randomMutation.id ??
      randomMutation.name ??
      "unknown_mutation",

    mutationName:
      randomMutation.name ??
      randomMutation.id ??
      "Unknown Mutation",

    mutationApplied: true,
  };
}