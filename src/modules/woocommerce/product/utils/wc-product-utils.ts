import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import sharp from 'sharp';
import { IImage } from '../application/interface/product.interface';
import { CloudinaryService } from '../application/service/cloudinary.service';

export async function convertImageToJpg(imageUrl: string): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');
  const tempFilePath = path.join(tempDir, `${Date.now()}.jfif`);
  const outputFilePath = path.join(tempDir, `${Date.now()}.jpg`);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(path.dirname(tempFilePath))) {
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
  }

  const file = fs.createWriteStream(tempFilePath);
  await new Promise((resolve, reject) => {
    https
      .get(imageUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (error) => {
        fs.unlink(tempFilePath, () => reject(error));
      });
  });

  if (!fs.existsSync(tempFilePath)) {
    throw new Error(`Temporary file not found: ${tempFilePath}`);
  }

  await sharp(tempFilePath).toFormat('jpeg').toFile(outputFilePath);

  if (!fs.existsSync(outputFilePath)) {
    throw new Error(`Converted file not found: ${outputFilePath}`);
  }

  fs.unlinkSync(tempFilePath);

  return outputFilePath;
}

// Utility function to convert and upload images
export async function convertAndUploadImage(
  src: string,
  cloudinaryService: CloudinaryService,
): Promise<IImage | null> {
  try {
    const jpgPath = await convertImageToJpg(src);
    const publicImageUrl =
      await cloudinaryService.uploadImageToCloudinary(jpgPath);
    return {
      src: publicImageUrl,
      alt: path.basename(src) || 'Product image',
      position: 0,
    };
  } catch (error) {
    console.error(
      `Error converting or uploading image: ${error instanceof Error ? error.message : error}`,
    );
    return null;
  }
}
