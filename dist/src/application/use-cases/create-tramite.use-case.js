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
exports.CreateTramiteUseCase = void 0;
const common_1 = require("@nestjs/common");
const tramite_repository_interface_1 = require("../../domain/repositories/tramite.repository.interface");
const audit_service_1 = require("../../infrastructure/audit/audit.service");
let CreateTramiteUseCase = class CreateTramiteUseCase {
    tramiteRepository;
    auditService;
    constructor(tramiteRepository, auditService) {
        this.tramiteRepository = tramiteRepository;
        this.auditService = auditService;
    }
    async execute(remitenteId, dto) {
        const tramite = await this.tramiteRepository.create({
            ...dto,
            remitenteId,
            fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
        });
        await this.auditService.logAction(tramite.id, 'TRAMITE', { ...dto, remitenteId });
        return tramite;
    }
};
exports.CreateTramiteUseCase = CreateTramiteUseCase;
exports.CreateTramiteUseCase = CreateTramiteUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tramite_repository_interface_1.ITramiteRepository)),
    __metadata("design:paramtypes", [Object, audit_service_1.AuditService])
], CreateTramiteUseCase);
//# sourceMappingURL=create-tramite.use-case.js.map