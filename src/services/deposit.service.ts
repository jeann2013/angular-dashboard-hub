import { apiService } from './api.service';
import { Deposit, CreateDepositRequest, UpdateDepositRequest } from '@/types/auth.types';

class DepositService {
  private endpoint = '/deposits';

  async getAll(): Promise<Deposit[]> {
    const response = await apiService.get<Deposit[]>(this.endpoint);
    return response.data;
  }

  async getById(id: string): Promise<Deposit> {
    const response = await apiService.get<Deposit>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateDepositRequest): Promise<Deposit> {
    const response = await apiService.post<Deposit>(this.endpoint, data);
    return response.data;
  }

  async update(id: string, data: UpdateDepositRequest): Promise<void> {
    await apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const depositService = new DepositService();
