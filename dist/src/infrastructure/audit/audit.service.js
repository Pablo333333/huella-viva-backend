"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAction(entityId, entityType, payload) {
        try {
            const lastAudit = await this.prisma.auditLog.findFirst({
                orderBy: { timestamp: 'desc' },
            });
            const previousHash = lastAudit ? lastAudit.payloadHash : '0'.repeat(64);
            const dataToHash = JSON.stringify(payload) + previousHash;
            const currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
            await this.prisma.auditLog.create({
                data: {
                    entityId,
                    entityType,
                    payloadHash: currentHash,
                    previousHash,
                },
            });
            this.logger.log(`Acción auditada para ${entityType} [${entityId}]. Hash: ${currentHash.substring(0, 8)}...`);
        }
        catch (error) {
            this.logger.error(`Error en AuditService: ${error.message}`);
        }
    }
    async verifyIntegrity(entityId) {
        const logs = await this.prisma.auditLog.findMany({
            where: { entityId },
            orderBy: { timestamp: 'asc' },
        });
        if (logs.length === 0)
            return { isValid: false, chain: [] };
        let isValid = true;
        const chainStatus = [];
        for (let i = 0; i < logs.length; i++) {
            const current = logs[i];
            if (i > 0) {
                const previous = logs[i - 1];
                if (current.previousHash !== previous.payloadHash) {
                    isValid = false;
                }
            }
            chainStatus.push({
                id: current.id,
                timestamp: current.timestamp,
                hash: current.payloadHash,
                valid: isValid,
            });
        }
        return { isValid, chain: chainStatus };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map