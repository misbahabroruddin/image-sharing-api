import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorMessage } from './errorHandler';
import { verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: any;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const authHeader: any = req.headers['authorization'];
    const token: any = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      throw new ErrorMessage('Unauthorized', 401);
    }

    const user: any = verifyToken(token);

    const foundUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    req.user = {
      id: foundUser?.id,
    };

    next();
  } catch (error) {
    next(error);
  }
};
