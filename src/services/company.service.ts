// Company Service - CRUD operations for Companies
// Integración con OpenTaxi API
import { apiService } from './api.service';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '@/types/auth.types';

class CompanyService {
  private endpoint = '/companies';

  /**
   * Obtener todas las compañías
   * GET /api/companies
   */
  async getAll(): Promise<Company[]> {
    const response = await apiService.get<Company[]>(this.endpoint);
    return response.data;
  }

  /**
   * Obtener una compañía por ID
   * GET /api/companies/{id}
   */
  async getById(id: string): Promise<Company> {
    const response = await apiService.get<Company>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Crear una nueva compañía
   * POST /api/companies
   */
  async create(data: CreateCompanyRequest): Promise<Company> {
    const response = await apiService.post<Company>(this.endpoint, data);
    return response.data;
  }

  /**
   * Actualizar una compañía existente
   * PUT /api/companies/{id}
   */
  async update(id: string, data: UpdateCompanyRequest): Promise<Company> {
    const response = await apiService.put<Company>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar una compañía
   * DELETE /api/companies/{id}
   */
  async delete(id: string): Promise<void> {
    await apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const companyService = new CompanyService();
