import type { Exercise } from "@/api/exercises/exModel";

export const exes: Exercise[] = [
  {
    id: 1,
    name: 'World',
  }
];

export class ExRepository {
  async findAllAsync(): Promise<Exercise[]> {
    return exes;
  }
}
