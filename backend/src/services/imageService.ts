import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const SIZES = {
  thumbnail: { width: 150, height: 150 },
  preview: { width: 600, height: 600 },
  full: { width: 1200, height: 1200 }
};

export class ImageService {
  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      logger.error('Failed to create upload directory:', error);
    }
  }

  async processImage(file: Express.Multer.File, catId: string): Promise<string[]> {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname).toLowerCase();
    const urls: string[] = [];

    try {
      for (const [size, dimensions] of Object.entries(SIZES)) {
        const filename = `${catId}-${timestamp}-${size}${extension}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await sharp(file.buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          })
          .toFile(filepath);

        urls.push(`/uploads/${filename}`);
      }

      return urls;
    } catch (error) {
      logger.error('Image processing failed:', error);
      throw new Error('Failed to process image');
    }
  }

  async deleteImages(urls: string[]) {
    for (const url of urls) {
      try {
        const filepath = path.join(UPLOAD_DIR, path.basename(url));
        await fs.unlink(filepath);
      } catch (error) {
        logger.error('Failed to delete image:', error);
      }
    }
  }
}