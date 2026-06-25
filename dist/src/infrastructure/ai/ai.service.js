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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let AiService = class AiService {
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
        });
    }
    async summarize(text) {
        if (!process.env.OPENAI_API_KEY) {
            return "IA: (Simulación) El hilo de conversación trata sobre la gestión técnica del ticket, destacando los puntos clave de la comunicación entre el usuario y el sistema.";
        }
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un asistente experto en gestión documental. Resume la siguiente conversación de un ticket de soporte en máximo 100 palabras." },
                { role: "user", content: text }
            ],
        });
        return response.choices[0].message.content || 'No se pudo generar el resumen.';
    }
    async classifyPriority(text) {
        const urgentWords = ['urgente', 'peligro', 'rotura', 'emergencia', 'inmediato', 'crítico'];
        const lowerText = text.toLowerCase();
        const isUrgent = urgentWords.some(word => lowerText.includes(urgentWords.find(w => lowerText.includes(w)) || ''));
        return isUrgent ? 'ALTA' : 'BAJA';
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map