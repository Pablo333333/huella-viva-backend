import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as multer from 'multer';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Cloudinary se configura automáticamente si CLOUDINARY_URL está en el entorno
    // pero podemos forzar la configuración si es necesario.
    if (process.env.CLOUDINARY_URL) {
      const url = process.env.CLOUDINARY_URL;
      const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
      const matches = url.match(regex);
      if (matches) {
        cloudinary.config({
          cloud_name: matches[3],
          api_key: matches[1],
          api_secret: matches[2],
        });
      }
    }
  }

  getStorage(folder: string = 'kontrolia') {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        // @ts-ignore
        folder: folder,
        resource_type: 'auto', // Permite subir audios, imágenes, etc.
        public_id: (req, file) => {
          const randomName = Array(16).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          return `${Date.now()}-${randomName}`;
        },
      },
    });
  }
}
