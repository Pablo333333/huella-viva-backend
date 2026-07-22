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
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Eres un asistente experto en gestión documental. Resume la siguiente conversación en máximo 100 palabras." },
                { role: "user", content: text }
            ],
        });
        return response.choices[0].message.content || 'No se pudo generar el resumen.';
    }
    async transcribeAudio(audioBuffer) {
        if (!process.env.OPENAI_API_KEY) {
            return "Transcripción simulada: El día de hoy visitamos la comunidad de El Roble para revisar el avance del pozo de agua.";
        }
        const transcription = await this.openai.audio.transcriptions.create({
            file: await openai_1.default.toFile(audioBuffer, 'audio.mp3'),
            model: "whisper-1",
        });
        return transcription.text;
    }
    async parseActivity(text) {
        if (!process.env.OPENAI_API_KEY) {
            return {
                tipo: 'VISITA',
                descripcion: text,
                fecha: new Date().toISOString(),
                commitments: []
            };
        }
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Actúa como un parser de lenguaje natural para gestión social territorial. 
          Extrae la siguiente información del texto en formato JSON estricto:
          - tipo: Uno de [REUNION, INSPECCION, VISITA, TALLER, OTRO]
          - descripcion: Resumen de lo ocurrido
          - fecha: Fecha mencionada o la actual en formato ISO
          - commitments: Lista de objetos con { descripcion, responsable, fecha_cumplimiento (ISO) }
          
          Texto: "${text}"`
                }
            ],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content || '{}');
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