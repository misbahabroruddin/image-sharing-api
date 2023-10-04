import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { nanoid } from 'nanoid';
import { ErrorMessage } from './errorHandler';
import { NextFunction } from 'express';

const cloudinaryConfig: any = cloudinary;

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: async (
    err: Error,
    _req: Request,
    _file: Request,
    next: NextFunction
  ) => {
    try {
      const folder: string = 'image-sharing';
      const public_id: string = nanoid(10);
      const allowed_formats: any = ['jpg, jpeg, svg, png'];
      const backup: boolean = false;
      const resource_type: string = 'image';

      if (resource_type != 'image') throw new ErrorMessage(err.message, 400);

      return {
        folder,
        allowed_formats,
        public_id,
        backup,
        resource_type,
      };
    } catch (err) {
      next(err);
    }
  },
});

const upload = multer({ storage });

export default upload;
