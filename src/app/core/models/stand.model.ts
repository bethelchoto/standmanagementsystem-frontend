export interface StandUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export interface Stand {
  id: string;
  name: string;
  standNumber: string;
  type: string;
  price: number;
  size: number;
  location: string;
  status: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  createdByUser: StandUser;
}

export interface StandsResponse {
  success: boolean;
  data: Stand[];
}

