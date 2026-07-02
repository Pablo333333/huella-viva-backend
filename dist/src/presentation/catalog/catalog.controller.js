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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let CatalogController = class CatalogController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getWorkflowStates() {
        return this.prisma.workflowState.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
            orderBy: { name: 'asc' },
        });
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('workflow-states'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getWorkflowStates", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getUsers", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)('catalog'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map