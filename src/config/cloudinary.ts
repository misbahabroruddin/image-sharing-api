import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

config();

const CLOUD_NAME: any = process.env.CLOUD_NAME;
const API_KEY: any = process.env.API_KEY;
const API_SECRET: any = process.env.API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export default cloudinary;
