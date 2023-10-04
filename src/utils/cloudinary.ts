import cloudinary from '../config/cloudinary';

export const deletePrevImage = async (filename: any) => {
  try {
    await cloudinary.api.delete_resources([filename?.image_name || '']);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
