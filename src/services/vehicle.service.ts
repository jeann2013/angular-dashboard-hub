import { apiService } from './api.service';
import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/auth.types';

class VehicleService {
  private endpoint = '/vehicles';

  async getAll(): Promise<Vehicle[]> {
    return (await apiService.get<Vehicle[]>(this.endpoint)).data;
  }

  async getById(id: string): Promise<Vehicle> {
    return (await apiService.get<Vehicle>(`${this.endpoint}/${id}`)).data;
  }

  async create(data: CreateVehicleRequest): Promise<Vehicle> {
    return (await apiService.post<Vehicle>(this.endpoint, data)).data;
  }

  async update(id: string, data: UpdateVehicleRequest): Promise<void> {
    await apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const vehicleService = new VehicleService();
