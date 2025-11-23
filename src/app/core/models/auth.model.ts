export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: 'admin' | 'general';
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UpdateUserProfileRequest {
  dateOfBirth?: string;
  nationalIdentityNumber?: string;
  profilePicture?: string; // base64 string when using application/json
  gender?: 'male' | 'female' | 'other';
}

export interface UpdateUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  dateOfBirth?: string;
  nationalIdentityNumber?: string;
  profilePicture?: string;
  gender?: 'male' | 'female' | 'other';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

