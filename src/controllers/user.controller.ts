import { PrismaClient, Prisma } from '@prisma/client';
import { Response, Request, NextFunction } from 'express';
import { comparePassword, hashPassword } from './../utils/bcrypt';
import { ErrorMessage } from '../middlewares/errorHandler';
import { deletePrevImage } from '../utils/cloudinary';

const prisma = new PrismaClient({
  log: ['query', 'error'],
});

class UserController {
  static async getUserLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const id: any = req.user?.id;

      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
        select: {
          first_name: true,
          last_name: true,
          email: true,
          username: true,
          profile_picture_url: true,
          images: {
            select: {
              id: true,
              title: true,
              description: true,
              image_url: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          comment: true,
          _count: {
            select: {
              images: true,
            },
          },
        },
      });

      if (!user) {
        throw new ErrorMessage('Unauthorized, please log in', 401);
      }

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully retrieve the data',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        first_name,
        last_name,
        username,
        oldPassword,
        newPassword,
        email,
      } = req.body;

      const imagePath: any = req.file?.path;
      const imageName: any = req.file?.filename;
      const id: any = req.user?.id;
      let data: Prisma.UserUncheckedUpdateInput;

      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!first_name || !username || !email || !oldPassword) {
        throw new ErrorMessage('Bad request', 400);
      }

      const isPasswordMatch = await comparePassword(oldPassword, user);

      if (!isPasswordMatch) {
        throw new ErrorMessage('Invalid credentials', 401);
      }

      if (!newPassword) {
        throw new ErrorMessage('Please insert new password', 400);
      }

      // delete prev image in cloudinary
      if (user?.image_name != null) {
        await deletePrevImage(user);
      }

      const hashedPassword = await hashPassword(newPassword);

      data = {
        first_name: first_name || user?.first_name,
        last_name: last_name || user?.last_name,
        username: username || user?.username,
        email: email || user?.email,
        password: hashedPassword || user?.password,
      };

      if (imagePath) {
        data = {
          ...data,
          profile_picture_url: imagePath,
          image_name: imageName,
        };
      }

      await prisma.user.update({
        where: {
          id,
        },
        data,
      });

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully update',
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async getByUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;

      const user = await prisma.user.findFirst({
        where: {
          username,
        },
        select: {
          first_name: true,
          last_name: true,
          username: true,
          profile_picture_url: true,
          images: {
            select: {
              id: true,
              title: true,
              description: true,
              image_url: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              images: true,
            },
          },
        },
      });

      if (!user) {
        throw new ErrorMessage('User not found', 404);
      }

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully retrieve the data',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
