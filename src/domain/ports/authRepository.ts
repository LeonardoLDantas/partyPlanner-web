import type { AuthenticatedUser, AuthSession } from '@/domain/entities/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export interface AuthRepository {
  login(input: LoginInput): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  me(accessToken: string): Promise<AuthenticatedUser>;
}
