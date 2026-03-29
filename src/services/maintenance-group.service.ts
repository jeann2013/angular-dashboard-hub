import { apiService } from './api.service';
import { MaintenanceGroup, CreateMaintenanceGroupRequest, UpdateMaintenanceGroupRequest } from '@/types/auth.types';

class MaintenanceGroupService {
  private endpoint = '/maintenance-groups';
  async getAll(): Promise<MaintenanceGroup[]> { return (await apiService.get<MaintenanceGroup[]>(this.endpoint)).data; }
  async getById(id: string): Promise<MaintenanceGroup> { return (await apiService.get<MaintenanceGroup>(`${this.endpoint}/${id}`)).data; }
  async create(data: CreateMaintenanceGroupRequest): Promise<MaintenanceGroup> { return (await apiService.post<MaintenanceGroup>(this.endpoint, data)).data; }
  async update(id: string, data: UpdateMaintenanceGroupRequest): Promise<void> { await apiService.put<void>(`${this.endpoint}/${id}`, data); }
  async delete(id: string): Promise<void> { await apiService.delete<void>(`${this.endpoint}/${id}`); }
}
export const maintenanceGroupService = new MaintenanceGroupService();
