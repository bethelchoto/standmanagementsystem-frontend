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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  emailVerified?: boolean | number;
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  nationalIdentityNumber?: string;
  profilePicture?: string;
  gender?: 'male' | 'female' | 'other';
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

export type UpdateUserProfileResponse = AuthUser;

export interface BasicResponse {
  success: boolean;
  message: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

