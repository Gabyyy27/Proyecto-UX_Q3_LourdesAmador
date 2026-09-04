export type User = {
  id: string;
  name: string;
  email: string;
  timezone: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  accessToken: string;
  user: User;
};

export type RegisterResponse = {
  message: string;
  user: User;
};