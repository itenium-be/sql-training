import { type Exercise } from "./exModel";
import { ExRepository } from "./exRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";

export class ExService {
  private repo = new ExRepository();

  async findAll(): Promise<ServiceResponse<Exercise[]>> {
    const result = await this.repo.findAllAsync();
    return ServiceResponse.success<Exercise[]>("Exercises found", result);
  }
}

export const exService = new ExService();
