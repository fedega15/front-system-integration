import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImageToCloudinary(filePath: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'products',
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch (error) {
      throw new Error(
        `Error uploading image to Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
