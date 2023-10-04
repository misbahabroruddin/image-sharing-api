import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error'],
});

class LikeController {
  static async like(req: Request, res: Response, _next: NextFunction) {
    try {
      const { image_id } = req.params;
      const user_id = req.user?.id;

      const foundUser = await prisma.like.findUnique({
        where: {
          user_id_image_id: {
            user_id,
            image_id,
          },
        },
      });

      if (foundUser) {
        await prisma.like.delete({
          where: {
            user_id_image_id: {
              user_id,
              image_id,
            },
          },
        });

        return res.status(200).json({
          status: 200,
          success: true,
          message: 'Successfully unlike the image',
        });
      }

      await prisma.like.create({
        data: {
          image_id: image_id,
          user_id: user_id,
        },
      });

      res.status(201).json({
        status: 201,
        success: true,
        message: 'Successfully like the image',
      });
    } catch (error) {
      res.status(404).json({
        status: 404,
        success: false,
        message: 'Image not found',
      });
    }
  }
}

export default LikeController;
