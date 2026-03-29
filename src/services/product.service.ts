import { apiService } from './api.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/auth.types';

class ProductService {
  private endpoint = '/products';

  async getAll(): Promise<Product[]> {
    const response = await apiService.get<Product[]>(this.endpoint);
    return response.data;
  }

  async getById(id: string): Promise<Product> {
    const response = await apiService.get<Product>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: CreateProductRequest): Promise<Product> {
    const response = await apiService.post<Product>(this.endpoint, data);
    return response.data;
  }

  async update(id: string, data: UpdateProductRequest): Promise<void> {
    await apiService.put<void>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const productService = new ProductService();
