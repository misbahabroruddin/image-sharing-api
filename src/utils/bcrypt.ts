import { hash, compare } from 'bcrypt';

export const hashPassword = async (password: string) => {
  return await hash(password, 10);
};

export const comparePassword = async (password: string, data: any) => {
  return await compare(password, data.password);
};
