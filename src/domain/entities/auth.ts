export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthSession = {
  accessToken: string;
  expiresAtUtc: string;
  user: AuthenticatedUser;
};
