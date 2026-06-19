/**
 * Tipos centralizados para API responses y requests
 */

// ===== Response Types =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===== User Types =====
export interface School {
  id: number;
  name: string;
  city?: string;
  country?: string;
  town?: string;
  type: string;
  level: string;
}

export interface UserBase {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'USER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  name?: string;
  age?: number | null;
  residence?: string | null;
  schoolId?: number | null;
  school?: School | string | null;
  avatarUrl?: string | null;
  arrivalDate?: string | null;
  departureDate?: string | null;
  country?: string | null;
  city?: string | null;
  town?: string | null;
}

export type UserUpdateData = Partial<Omit<UserBase, 'id' | 'email' | 'role' | 'school'>> & {
  school?: string | null;
  country?: string | null;
  city?: string | null;
  town?: string | null;
};

export interface UserStorageData {
  id: number;
  name?: string;
  email: string;
  role: UserBase['role'];
  schoolId?: number | null;
  avatarUrl?: string | null;
  country?: string | null;
  residence?: string | null;
  city?: string | null;
  town?: string | null;
}

// ===== Auth Types =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse<{ user: UserBase }> {
  token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age?: number;
  schoolId?: number;
  residence?: string;
  country?: string;
  city?: string;
  town?: string;
}

// ===== Task Types =====
export interface TaskData {
  id: number | string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  schoolId?: number | null;
  groupId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: TaskData['priority'];
  dueDate?: string;
  schoolId?: number;
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  completed?: boolean;
}

// ===== Event Types =====
export interface EventData {
  id: string;
  title: string;
  date: string;
  description?: string;
  location?: string;
  userId?: number;
  createdAt?: string;
}

// ===== Feedback Types =====
export interface FeedbackData {
  id?: number;
  userId?: number;
  email?: string;
  message: string;
  createdAt?: string;
  rating?: number;
}

// ===== Telemetry Types =====
export interface TelemetryEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
  userId?: number;
  sessionId?: string;
}

// ===== Notification Types =====
export interface NotificationData {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
  userId?: number;
}

export interface PushSubscriptionData {
  userId: number;
  subscription: PushSubscription;
}

// ===== Form Validation Types =====
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// ===== HTTP Method Types =====
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  body?: unknown;
  timeout?: number;
  retries?: number;
}
