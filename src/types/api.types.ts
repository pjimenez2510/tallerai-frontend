export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorData {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

export class ApiError extends Error {
  statusCode: number;
  error: string;
  timestamp: string;

  constructor(data: ApiErrorData) {
    super(data.message);
    this.name = 'ApiError';
    this.statusCode = data.statusCode;
    this.error = data.error;
    this.timestamp = data.timestamp;
  }
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
