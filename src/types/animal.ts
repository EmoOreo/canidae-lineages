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

  stats: {
    fertility: number;
    stability: number;
  };
}