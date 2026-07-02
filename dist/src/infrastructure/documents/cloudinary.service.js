"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
let CloudinaryService = class CloudinaryService {
    constructor() {
        if (process.env.CLOUDINARY_URL) {
            const url = process.env.CLOUDINARY_URL;
            const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
            const matches = url.match(regex);
            if (matches) {
                cloudinary_1.v2.config({
                    cloud_name: matches[3],
                    api_key: matches[1],
                    api_secret: matches[2],
                });
            }
        }
    }
    getStorage(folder = 'kontrolia') {
        return new multer_storage_cloudinary_1.CloudinaryStorage({
            cloudinary: cloudinary_1.v2,
            params: {
                folder: folder,
                resource_type: 'auto',
                public_id: (req, file) => {
                    const randomName = Array(16).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    return `${Date.now()}-${randomName}`;
                },
            },
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map