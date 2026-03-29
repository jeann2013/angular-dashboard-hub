// Authentication types - Strongly typed for JWT auth
// Compatible with OpenTaxi API

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user';
  tenantId?: string;
}

// LoginRequest según el Swagger del API
export interface LoginCredentials {
  email: string;
  password: string;
}

// RegisterUserRequest según el Swagger del API
export interface RegisterCredentials {
  email: string;
  password: string;
  tenantId?: string;
  name?: string;
}

// Respuesta de login del API OpenTaxi (JWT token)
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
}

// Respuesta estándar del API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Tipos para Companies (CRUD)
export interface Company {
  id: string;
  name: string;
  taxId: string;
}

export interface CreateCompanyRequest {
  name: string;
  taxId: string;
}

export interface UpdateCompanyRequest {
  name: string;
  taxId: string;
}

// Tipos para Operators (CRUD)
export interface Operator {
  id: string;
  operatorNumber: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobilePhone1: string;
  mobilePhone2?: string;
  phone1?: string;
  phone2?: string;
  assignedUnitNumber?: string;
  hireDate: string;
  address?: string;
  userId: string;
  photo?: string;
  birthDate: string;
  age?: string;
  status: number;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  referenceUnitNumber?: string;
  licenseType?: string;
  licenseExpirationDate: string;
  maritalStatus?: string;
  province?: string;
  chargeSunday: number;
  term: number;
}

export interface CreateOperatorRequest {
  operatorNumber: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobilePhone1: string;
  mobilePhone2?: string;
  phone1?: string;
  phone2?: string;
  assignedUnitNumber?: string;
  hireDate: string;
  address?: string;
  userId: string;
  birthDate: string;
  age?: string;
  status: number;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  referenceUnitNumber?: string;
  licenseType?: string;
  licenseExpirationDate: string;
  maritalStatus?: string;
  province?: string;
  chargeSunday: number;
  term: number;
}

export type UpdateOperatorRequest = CreateOperatorRequest;

// ── Deposits ──────────────────────────────────────────────────────────────────
export interface Deposit {
  id: string;
  description: string;
  status: number;
}

export interface CreateDepositRequest {
  description: string;
  status: number;
}

export type UpdateDepositRequest = CreateDepositRequest;

// ── Products ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  description: string;
  unit?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  reference?: string;
  classCode: number;
  brandCode: number;
  departmentCode: number;
  manufacturerCode?: string;
  status: number;
  cost: number;
  minimumStock: number;
  maximumStock: number;
}

export interface CreateProductRequest {
  description: string;
  unit?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  reference?: string;
  classCode: number;
  brandCode: number;
  departmentCode: number;
  manufacturerCode?: string;
  status: number;
  cost: number;
  minimumStock: number;
  maximumStock: number;
}

export type UpdateProductRequest = CreateProductRequest;

// ── Brands ────────────────────────────────────────────────────────────────────
export interface Brand {
  id: string;
  description: string;
}
export interface CreateBrandRequest { description: string; }
export type UpdateBrandRequest = CreateBrandRequest;

// ── MaintenanceGroups ─────────────────────────────────────────────────────────
export interface MaintenanceGroup {
  id: string;
  description: string;
}
export interface CreateMaintenanceGroupRequest { description: string; }
export type UpdateMaintenanceGroupRequest = CreateMaintenanceGroupRequest;

// ── DailyGroups ───────────────────────────────────────────────────────────────
export interface DailyGroup {
  id: string;
  description: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  specialDay: number;
}
export interface CreateDailyGroupRequest {
  description: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  specialDay: number;
}
export type UpdateDailyGroupRequest = CreateDailyGroupRequest;

// ── Suppliers ─────────────────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  taxId?: string;
  address?: string;
  representative?: string;
  status: number;
  phone?: string;
  country?: string;
  email?: string;
}
export interface CreateSupplierRequest {
  name: string;
  taxId?: string;
  address?: string;
  representative?: string;
  status: number;
  phone?: string;
  country?: string;
  email?: string;
}
export type UpdateSupplierRequest = CreateSupplierRequest;

// ── Vehicles ──────────────────────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  unitNumber: string;
  companyCode: number;
  licensePlate: string;
  year?: string;
  brand?: string;
  model?: string;
  chassisNumber?: string;
  engineSerial?: string;
  quotaNumber?: string;
  quotaDate: string;
  policyNumber?: string;
  policyDate: string;
  purchaseDate: string;
  inspectionDate: string;
  assignedTechnician?: string;
  status: number;
  gpsNumber?: string;
  radioNumber?: string;
  date: string;
  maintenanceGroupId: string;
  maintenanceGroupDescription?: string;
  dailyGroupId: string;
  dailyGroupDescription?: string;
  dailyAmount: number;
  mileage: number;
  operatorNumber?: number;
  financed: number;
  ignitionStatus?: string;
  charge: number;
  installments: number;
}

export interface CreateVehicleRequest {
  unitNumber: string;
  companyCode: number;
  licensePlate: string;
  year?: string;
  brand?: string;
  model?: string;
  chassisNumber?: string;
  engineSerial?: string;
  quotaNumber?: string;
  quotaDate: string;
  policyNumber?: string;
  policyDate: string;
  purchaseDate: string;
  inspectionDate: string;
  assignedTechnician?: string;
  status: number;
  gpsNumber?: string;
  radioNumber?: string;
  date: string;
  maintenanceGroupId: string;
  dailyGroupId: string;
  dailyAmount: number;
  mileage: number;
  operatorNumber?: number | null;
  financed: number;
  ignitionStatus?: string;
  charge: number;
  installments: number;
}

export type UpdateVehicleRequest = CreateVehicleRequest;
