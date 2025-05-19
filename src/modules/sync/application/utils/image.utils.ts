import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as Jimp from 'jimp';
import fetch from 'node-fetch';
import { IImage } from '@/modules/woocommerce/product/application/interface/product.interface';
import { CloudinaryService } from '@/modules/woocommerce/product/application/service/cloudinary.service';
import { Logger } from '@nestjs/common';

export class ImageUtils {
  private static readonly logger = new Logger(ImageUtils.name);
  private static readonly TEMP_DIR = path.join(os.tmpdir(), 'front-system-integration');

  static async processImages(images: string[], cloudinaryService: CloudinaryService): Promise<IImage[]> {
    const processedImages: IImage[] = [];

    this.logger.debug('Iniciando procesamiento de imágenes', {
      totalImages: images.length,
      images: images
    });

    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }

    for (const imageUrl of images) {
      try {
        if (!imageUrl.startsWith('http')) {
          this.logger.warn(`URL de imagen inválida: ${imageUrl}`);
          continue;
        }

        this.logger.debug(`Procesando imagen: ${imageUrl}`);

        const tempFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const tempFilePath = path.join(this.TEMP_DIR, tempFileName);

        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Error al descargar imagen: ${response.statusText}`);
        }
        const buffer = await response.buffer();

        fs.writeFileSync(tempFilePath, buffer);

        const image = await Jimp.read(tempFilePath);
        await image
          .scaleToFit(800, 800)
          .quality(80)
          .writeAsync(tempFilePath);

        this.logger.debug(`Subiendo imagen a Cloudinary: ${tempFilePath}`);
        const uploadResult = await cloudinaryService.uploadImageToCloudinary(tempFilePath);

        this.logger.debug(`Imagen subida exitosamente a Cloudinary: ${uploadResult}`);

        processedImages.push({
          src: uploadResult,
          alt: path.basename(imageUrl),
          position: processedImages.length
        });

        fs.unlinkSync(tempFilePath);
      } catch (error) {
        this.logger.error(`Error procesando imagen ${imageUrl}:`, error);
      }
    }

    this.logger.debug('Procesamiento de imágenes completado', {
      processedImages: processedImages.length,
      images: processedImages.map(img => img.src)
    });

    return processedImages;
  }
} 