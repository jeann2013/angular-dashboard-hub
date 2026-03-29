import { apiService } from './api.service';
import { Operator, CreateOperatorRequest, UpdateOperatorRequest } from '@/types/auth.types';

class OperatorService {
  private endpoint = '/operators';

  async getAll(): Promise<Operator[]> {
    const response = await apiService.get<Operator[]>(this.endpoint);
    return response.data;
  }

  async getById(id: string): Promise<Operator> {
    const response = await apiService.get<Operator>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateOperatorRequest): Promise<Operator> {
    const response = await apiService.post<Operator>(this.endpoint, data);
    return response.data;
  }

  async update(id: string, data: UpdateOperatorRequest): Promise<void> {
    await apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const operatorService = new OperatorService();
