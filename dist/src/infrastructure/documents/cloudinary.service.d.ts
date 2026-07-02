import { CloudinaryStorage } from 'multer-storage-cloudinary';
export declare class CloudinaryService {
    constructor();
    getStorage(folder?: string): CloudinaryStorage;
}
