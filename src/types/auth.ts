export interface User {
  id: number;
  email: string;
  role: "CANDIDATE" | "ADMIN";
  full_name?: string;
  status: "ACTIVE" | "LOCKED" | "PENDING";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}
