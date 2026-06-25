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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDocumentUseCase = void 0;
const common_1 = require("@nestjs/common");
const document_repository_interface_1 = require("../../domain/repositories/document.repository.interface");
const document_entity_1 = require("../../domain/entities/document.entity");
const ocr_service_1 = require("../../infrastructure/ocr/ocr.service");
let UploadDocumentUseCase = class UploadDocumentUseCase {
    documentRepository;
    ocrService;
    constructor(documentRepository, ocrService) {
        this.documentRepository = documentRepository;
        this.ocrService = ocrService;
    }
    async execute(data) {
        const document = new document_entity_1.Document({
            name: data.name,
            url: data.url,
            type: data.type,
            userId: data.userId,
            ticketId: data.ticketId,
            tramiteId: data.tramiteId,
        });
        const createdDocument = await this.documentRepository.create(document);
        if (data.type.includes('image') || data.type.includes('pdf')) {
            this.processOcr(createdDocument.id, data.url);
        }
        return createdDocument;
    }
    async processOcr(documentId, fileUrl) {
        const filePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
        try {
            const text = await this.ocrService.extractText(filePath);
            if (text) {
                await this.documentRepository.updateExtractedText(documentId, text);
            }
        }
        catch (error) {
            console.error('Error procesando OCR en segundo plano:', error);
        }
    }
};
exports.UploadDocumentUseCase = UploadDocumentUseCase;
exports.UploadDocumentUseCase = UploadDocumentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(document_repository_interface_1.IDocumentRepository)),
    __metadata("design:paramtypes", [Object, ocr_service_1.OcrService])
], UploadDocumentUseCase);
//# sourceMappingURL=upload-document.use-case.js.map