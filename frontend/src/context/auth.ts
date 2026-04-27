export interface User {
  id: string;
  username: string;
  email?: string;
  is_guest: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}