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
var PredictiveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../ai/ai.service");
let PredictiveService = PredictiveService_1 = class PredictiveService {
    aiService;
    logger = new common_1.Logger(PredictiveService_1.name);
    constructor(aiService) {
        this.aiService = aiService;
    }
    async analyzeDocumentText(text) {
        this.logger.log('Analizando texto extraído para sugerencias predictivas...');
        const prompt = `
      Analiza el siguiente texto extraído de un documento o reporte de obra y devuelve un objeto JSON con las siguientes sugerencias para un sistema de gestión de tickets:
      
      1. "tipo": Clasifica entre (SOLICITUD, CARTA, OFICIO, INFORME).
      2. "prioridad": Clasifica entre (URGENTE, MEDIA, BAJA).
      3. "responsableSugerido": Identifica si se menciona un nombre de persona o departamento específico al que deba dirigirse.
      4. "resumen": Un resumen de 15 palabras del propósito o problema reportado.
      5. "titulo": Un título corto y descriptivo de máximo 6 palabras.

      Texto:
      "${text.substring(0, 2000)}"

      Responde ÚNICAMENTE con el objeto JSON.
    `;
        try {
            const response = await this.aiService.openai.chat.completions.create({
                model: "gpt-3.5-turbo-0125",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });
            const suggestions = JSON.parse(response.choices[0].message.content);
            return suggestions;
        }
        catch (error) {
            this.logger.error(`Error en análisis predictivo: ${error.message}`);
            return {
                tipo: 'SOLICITUD',
                prioridad: 'MEDIA',
                resumen: 'No se pudo analizar el documento automáticamente.',
                titulo: 'Nuevo Ticket (OCR)'
            };
        }
    }
};
exports.PredictiveService = PredictiveService;
exports.PredictiveService = PredictiveService = PredictiveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], PredictiveService);
//# sourceMappingURL=predictive.service.js.map