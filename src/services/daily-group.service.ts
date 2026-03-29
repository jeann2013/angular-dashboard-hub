import { apiService } from './api.service';
import { DailyGroup, CreateDailyGroupRequest, UpdateDailyGroupRequest } from '@/types/auth.types';

class DailyGroupService {
  private endpoint = '/daily-groups';
  async getAll(): Promise<DailyGroup[]> { return (await apiService.get<DailyGroup[]>(this.endpoint)).data; }
  async getById(id: string): Promise<DailyGroup> { return (await apiService.get<DailyGroup>(`${this.endpoint}/${id}`)).data; }
  async create(data: CreateDailyGroupRequest): Promise<DailyGroup> { return (await apiService.post<DailyGroup>(this.endpoint, data)).data; }
  async update(id: string, data: UpdateDailyGroupRequest): Promise<void> { await apiService.put<void>(`${this.endpoint}/${id}`, data); }
  async delete(id: string): Promise<void> { await apiService.delete<void>(`${this.endpoint}/${id}`); }
}
export const dailyGroupService = new DailyGroupService();
