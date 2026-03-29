import { apiService } from './api.service';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/types/auth.types';

class SupplierService {
  private endpoint = '/suppliers';
  async getAll(): Promise<Supplier[]> { return (await apiService.get<Supplier[]>(this.endpoint)).data; }
  async getById(id: string): Promise<Supplier> { return (await apiService.get<Supplier>(`${this.endpoint}/${id}`)).data; }
  async create(data: CreateSupplierRequest): Promise<Supplier> { return (await apiService.post<Supplier>(this.endpoint, data)).data; }
  async update(id: string, data: UpdateSupplierRequest): Promise<void> { await apiService.put<void>(`${this.endpoint}/${id}`, data); }
  async delete(id: string): Promise<void> { await apiService.delete<void>(`${this.endpoint}/${id}`); }
}
export const supplierService = new SupplierService();
