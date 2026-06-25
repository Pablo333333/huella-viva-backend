"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tramite = void 0;
class Tramite {
    id;
    tipo;
    remitenteId;
    destinatarioId;
    estadoId;
    createdAt;
    updatedAt;
    fechaLimite;
    remitenteName;
    destinatarioName;
    estadoName;
    constructor(id, tipo, remitenteId, destinatarioId, estadoId, createdAt, updatedAt, fechaLimite, remitenteName, destinatarioName, estadoName) {
        this.id = id;
        this.tipo = tipo;
        this.remitenteId = remitenteId;
        this.destinatarioId = destinatarioId;
        this.estadoId = estadoId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.fechaLimite = fechaLimite;
        this.remitenteName = remitenteName;
        this.destinatarioName = destinatarioName;
        this.estadoName = estadoName;
    }
}
exports.Tramite = Tramite;
//# sourceMappingURL=tramite.entity.js.map