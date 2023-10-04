import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

const SECRET_KEY: any = process.env.JWT_SECRET_KEY;

export const generateToken = (data: any) => {
  const token = jwt.sign(
    {
      id: data.id,
    },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  return token;
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
