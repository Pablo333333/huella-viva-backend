"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditPresentationModule = void 0;
const common_1 = require("@nestjs/common");
const audit_controller_1 = require("./audit.controller");
const audit_module_1 = require("../../infrastructure/audit/audit.module");
let AuditPresentationModule = class AuditPresentationModule {
};
exports.AuditPresentationModule = AuditPresentationModule;
exports.AuditPresentationModule = AuditPresentationModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        controllers: [audit_controller_1.AuditController],
    })
], AuditPresentationModule);
//# sourceMappingURL=audit.module.js.map