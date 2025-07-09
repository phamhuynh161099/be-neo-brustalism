export interface User {
  id: number;
  email: string;
  username: string;
  password?: string;
  is_active: string | number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password_hash: string;
}

export interface UpdateUserDto {
  email: string;
  is_active: string | number;
}

export interface UserFilter {
  is_active: string | number;
  email?: string;
  name?: string;
  created_from?: Date;
  created_to?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
