import type { UserProfile } from '@/src/modules/settings/types/profile.types';

export type AuthUser = {
   id: string;
   email: string;
   fullName: string;
   avatarUrl?: string;
   profile: UserProfile | null;
};

export type AuthSession = {
   token: string;
   userId: string;
   expiresAt: number;
   refreshToken?: string;
};

export type LoginPayload = {
   email: string;
   password: string;
};

export type RegisterPayload = {
   email: string;
   password: string;
   fullName: string;
};

export type AuthProvider = 'supabase';
