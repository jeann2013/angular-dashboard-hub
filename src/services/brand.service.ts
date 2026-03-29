import { apiService } from './api.service';
import { Brand, CreateBrandRequest, UpdateBrandRequest } from '@/types/auth.types';

class BrandService {
  private endpoint = '/brands';
  async getAll(): Promise<Brand[]> { return (await apiService.get<Brand[]>(this.endpoint)).data; }
  async getById(id: string): Promise<Brand> { return (await apiService.get<Brand>(`${this.endpoint}/${id}`)).data; }
  async create(data: CreateBrandRequest): Promise<Brand> { return (await apiService.post<Brand>(this.endpoint, data)).data; }
  async update(id: string, data: UpdateBrandRequest): Promise<void> { await apiService.put<void>(`${this.endpoint}/${id}`, data); }
  async delete(id: string): Promise<void> { await apiService.delete<void>(`${this.endpoint}/${id}`); }
}
export const brandService = new BrandService();
