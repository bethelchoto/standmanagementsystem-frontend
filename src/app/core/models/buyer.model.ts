export interface Buyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalIdentityNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StandBuyerLink {
  id: string;
  standId: string;
  buyerId: string | null;
  buyerUserId: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string | null;
  releaseReason?: string | null;
  buyer?: Buyer;
}


