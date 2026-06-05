export type TraitValue = string | number | boolean | string[];

export interface Animal {
  id: string;
  name: string;
  speciesId: string;
  generation: number;

  genome: {
    D: string[];
    R: string[];
    M: string[];
    L: Record<string, number>;
  };

  phenotype: Record<string, TraitValue>;

  stats: {
    fertility: number;
    stability: number;
  };
}