import { NextFunction, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { comparePassword, hashPassword } from './../utils/bcrypt';
import { ErrorMessage } from './../middlewares/errorHandler';
import { generateToken } from './../utils/jwt';

const prisma = new PrismaClient({
  log: ['query', 'error'],
});

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { first_name, last_name, username, email, password } = req.body;
      let data: Prisma.UserCreateInput;
      const id = nanoid(10);

      if (!first_name || !username || !email || !password) {
        throw new ErrorMessage('Bad request', 400);
      }

      if (password.length < 8) {
        throw new ErrorMessage('Password must be at least 8 characters', 400);
      }

      const isUserExist = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: email,
            },
            {
              username: username,
            },
          ],
        },
      });

      if (isUserExist) {
        throw new ErrorMessage('User already exists!', 409);
      }

      const hashedPassword = await hashPassword(password);

      data = {
        id,
        first_name,
        username,
        email,
        password: hashedPassword,
      };

      if (last_name) {
        data = {
          ...data,
          last_name,
        };
      }

      const user = await prisma.user.create({
        data,
      });

      res.status(201).json({
        status: 201,
        success: true,
        message: 'Successfully log in',
        data: user.id,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { usernameOrEmail, password } = req.body;

      const foundUser = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: usernameOrEmail,
            },
            {
              username: usernameOrEmail,
            },
          ],
        },
      });

      const isPasswordMatch = await comparePassword(password, foundUser);

      if (!isPasswordMatch) {
        throw new ErrorMessage('Invalid credentials', 401);
      }

      const token = generateToken(foundUser);

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Sucessfully login',
        token,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default AuthController;
