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
exports.UpdateTramiteDto = exports.CreateTramiteDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateTramiteDto {
    tipo;
    destinatarioId;
    estadoId;
    fechaLimite;
}
exports.CreateTramiteDto = CreateTramiteDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TramiteType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTramiteDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTramiteDto.prototype, "destinatarioId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTramiteDto.prototype, "estadoId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTramiteDto.prototype, "fechaLimite", void 0);
class UpdateTramiteDto {
    tipo;
    destinatarioId;
    estadoId;
    fechaLimite;
}
exports.UpdateTramiteDto = UpdateTramiteDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TramiteType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTramiteDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTramiteDto.prototype, "destinatarioId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTramiteDto.prototype, "estadoId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTramiteDto.prototype, "fechaLimite", void 0);
//# sourceMappingURL=tramite.dto.js.map