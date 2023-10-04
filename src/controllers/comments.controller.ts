import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { ErrorMessage } from '../middlewares/errorHandler';

const prisma = new PrismaClient({
  log: ['query', 'error'],
});

class CommentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { comment } = req.body;
      const { image_id } = req.params;
      const user_id = req.user?.id;
      let data: Prisma.CommentCreateManyInput = {
        comment,
        image_id,
        user_id,
      };

      const foundImage = await prisma.image.findUnique({
        where: {
          id: image_id,
        },
      });

      if (!foundImage || !comment) {
        throw new ErrorMessage('Bad request', 400);
      }

      await prisma.comment.create({
        data,
      });

      res.status(201).json({
        status: 201,
        success: true,
        message: 'Successfully create comment',
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { comment } = req.body;
      const { id, image_id } = req.params;
      const user_id = req.user?.id;
      let data: Prisma.CommentCreateManyInput = {
        comment,
        image_id,
        user_id,
      };

      const foundImage = await prisma.image.findUnique({
        where: {
          id: image_id,
        },
      });

      const foundComment = await prisma.comment.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (!foundImage || !comment) {
        throw new ErrorMessage('Bad request', 400);
      }

      if (!foundComment) {
        throw new ErrorMessage('Comment not found', 404);
      }

      await prisma.comment.update({
        where: {
          id: foundComment.id,
        },
        data,
      });

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully update comment',
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, image_id } = req.params;
      const user_id = req.user?.id;

      const foundImage = await prisma.image.findUnique({
        where: {
          id: image_id,
        },
      });

      const foundComment = await prisma.comment.findFirst({
        where: {
          AND: [
            {
              id: parseInt(id),
            },
            {
              user_id,
            },
          ],
        },
      });

      if (!foundImage || !foundComment) {
        throw new ErrorMessage('Comment not found', 404);
      }

      await prisma.comment.delete({
        where: {
          id: foundComment.id,
        },
      });

      res.status(200).json({
        status: 200,
        success: true,
        message: 'Successfully delete comment',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentController;
