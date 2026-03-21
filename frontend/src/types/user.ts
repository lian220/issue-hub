export interface User {
  id: string;
  email: string;
  name: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  teamId?: string;
  team?: Team;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  leader?: User;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}
