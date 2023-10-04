import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { ErrorMessage } from '../middlewares/errorHandler';
import { deletePrevImage } from '../utils/cloudinary';

const prisma = new PrismaClient({
  log: ['query', 'error'],
});

class ImageController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const id = nanoid(10);
      let data: Prisma.ImageCreateManyInput;
      const userId = req.user?.id;
      const imagePath = req.file?.path;
      const imageName = req.file?.filename;

      if (!title || !req.file) {
        throw new ErrorMessage('Bad request', 400);
      }

      data = {
        id,
        title,
        description,
        image_url: imagePath || '',
        image_name: imageName,
        author_id: userId,
      };

      const image = await prisma.image.create({
        data,
      });

      res.status(201).json({
        status: 201,
        success: true,
        message: 'Successfully create',
        data: image.id,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const image = await prisma.image.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          image_url: true,
          createdAt: true,
          author: {
            select: {
              first_name: true,
              last_name: true,
              username: true,
              profile_picture_url: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comment: true,
            },
          },
        },
      });

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully retrieve the data',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const image = await prisma.image.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          image_url: true,
          createdAt: true,
          author: {
            select: {
              first_name: true,
              last_name: true,
              username: true,
              profile_picture_url: true,
            },
          },
          comment: {
            select: {
              id: true,
              comment: true,
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  username: true,
                  profile_picture_url: true,
                },
              },
              createdAt: true,
            },
          },
          likes: {
            select: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  username: true,
                  profile_picture_url: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comment: true,
            },
          },
        },
      });

      if (!image) {
        throw new ErrorMessage('Image not found', 404);
      }

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully retrieve the data',
        data: image,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const { id } = req.params;
      const user_id = req.user?.id;
      const imagePath: any = req.file?.path;
      const imageName: any = req.file?.filename;

      let data: Prisma.ImageUpdateWithoutAuthorInput;

      const foundImage = await prisma.image.findFirst({
        where: {
          AND: [
            {
              id: id,
            },
            {
              author_id: user_id,
            },
          ],
        },
      });

      if (!foundImage) {
        throw new ErrorMessage('Image not found', 404);
      }
      data = {
        id,
        title,
        description,
      };

      if (req.file) {
        data = {
          ...data,
          image_url: imagePath,
          image_name: imageName,
        };
        // delete prev image in cloudinary
        await deletePrevImage(foundImage);
      }

      await prisma.image.update({
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
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const foundImage = await prisma.image.findFirst({
        where: {
          AND: [
            {
              id,
            },
            {
              author_id: userId,
            },
          ],
        },
      });

      if (!foundImage) {
        throw new ErrorMessage('Image not found', 404);
      }

      await deletePrevImage(foundImage);

      await prisma.image.delete({
        where: {
          id,
        },
      });

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully delete',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ImageController;
