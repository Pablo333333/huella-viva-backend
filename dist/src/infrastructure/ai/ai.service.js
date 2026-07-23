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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
        });
    }
    async summarize(text) {
        if (!process.env.OPENAI_API_KEY) {
            return 'IA: (Simulación) Resumen territorial generado localmente para la feria.';
        }
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Eres un asistente experto en gestión documental. Resume la siguiente conversación en máximo 100 palabras.',
                },
                { role: 'user', content: text },
            ],
        });
        return (response.choices[0].message.content ||
            'No se pudo generar el resumen.');
    }
    async transcribeAudio(audioBuffer) {
        if (!process.env.OPENAI_API_KEY) {
            this.logger.warn('OPENAI_API_KEY ausente: devolviendo transcripción simulada.');
            return 'Hoy visité la comunidad El Roble para revisar el avance del pozo de agua. Compromiso: entregar 50 metros de tubería el próximo jueves.';
        }
        const transcription = await this.openai.audio.transcriptions.create({
            file: await openai_1.default.toFile(audioBuffer, 'audio.m4a'),
            model: 'whisper-1',
        });
        return transcription.text;
    }
    async parseActivity(text) {
        if (!process.env.OPENAI_API_KEY) {
            this.logger.warn('OPENAI_API_KEY ausente: usando parser local de lenguaje natural.');
            return this.parseActivityLocally(text);
        }
        const todayIso = new Date().toISOString();
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Actúa como un parser de lenguaje natural para gestión social territorial en Colombia.
Hoy es ${todayIso}.
Extrae la siguiente información del texto en formato JSON estricto:
- tipo: Uno de [REUNION, INSPECCION, VISITA, TALLER, OTRO]
- descripcion: Resumen claro de lo ocurrido o lo planificado
- fecha: SOLO si el texto menciona una fecha explícita (hoy, mañana, día de la semana, día del mes, etc.). Si NO hay fecha, usa exactamente: ${todayIso}
- comunidadNombre: Nombre de la comunidad/territorio si se menciona (o null)
- commitments: Lista de objetos con { descripcion, responsable, fecha_cumplimiento (ISO o null) }
Si no hay compromisos explícitos pero hay una reunión o visita futura, crea al menos un compromiso de seguimiento.`,
                },
                { role: 'user', content: text },
            ],
            response_format: { type: 'json_object' },
        });
        const parsed = JSON.parse(response.choices[0].message.content || '{}');
        return {
            tipo: parsed.tipo || 'OTRO',
            descripcion: parsed.descripcion || text,
            fecha: this.resolveActivityFecha(text, parsed.fecha),
            comunidadNombre: parsed.comunidadNombre,
            commitments: Array.isArray(parsed.commitments)
                ? parsed.commitments
                : [],
        };
    }
    parseActivityLocally(text) {
        const lower = text.toLowerCase();
        const tipo = this.detectTipo(lower);
        const fecha = this.detectFecha(text, lower);
        const comunidadNombre = this.detectComunidad(text);
        const commitments = this.detectCommitments(text, tipo, fecha);
        return {
            tipo,
            descripcion: text.trim(),
            fecha: this.resolveActivityFecha(text, fecha.toISOString()),
            comunidadNombre: comunidadNombre ?? undefined,
            commitments,
        };
    }
    resolveActivityFecha(text, parsedFecha) {
        const now = new Date();
        if (!this.textMentionsExplicitDate(text)) {
            return now.toISOString();
        }
        if (!parsedFecha) {
            return now.toISOString();
        }
        const parsed = new Date(parsedFecha);
        if (Number.isNaN(parsed.getTime())) {
            return now.toISOString();
        }
        if (!/\b20\d{2}\b/.test(text) && parsed.getFullYear() !== now.getFullYear()) {
            parsed.setFullYear(now.getFullYear());
        }
        return parsed.toISOString();
    }
    textMentionsExplicitDate(text) {
        const lower = text.toLowerCase();
        return (/\bhoy\b/.test(lower) ||
            /\bmañana\b/.test(lower) ||
            /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/.test(lower) ||
            /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(lower) ||
            /\b(?:el\s+)?\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/.test(lower) ||
            /\b\d{1,2}\s+a\s+las\b/.test(lower));
    }
    detectTipo(lower) {
        if (/reuni[oó]n|encuentro|asamblea/.test(lower))
            return 'REUNION';
        if (/inspecci[oó]n|revisi[oó]n t[eé]cnica|verificar/.test(lower))
            return 'INSPECCION';
        if (/taller|capacitaci[oó]n|formaci[oó]n/.test(lower))
            return 'TALLER';
        if (/visit[eé]|visit[oó]|visité|estuve en|fuimos a/.test(lower))
            return 'VISITA';
        return 'OTRO';
    }
    detectFecha(text, lower) {
        const now = new Date();
        if (!this.textMentionsExplicitDate(text)) {
            return now;
        }
        if (/\bhoy\b/.test(lower)) {
            return now;
        }
        if (/\bmañana\b/.test(lower)) {
            const d = new Date(now);
            d.setDate(d.getDate() + 1);
            return d;
        }
        const dayMatch = lower.match(/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b(?:\s+(\d{1,2}))?/);
        const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?\s*m\.?|p\.?\s*m\.?)/);
        const result = new Date(now);
        if (dayMatch) {
            const weekdayMap = {
                domingo: 0,
                lunes: 1,
                martes: 2,
                miercoles: 3,
                miércoles: 3,
                jueves: 4,
                viernes: 5,
                sabado: 6,
                sábado: 6,
            };
            const targetDow = weekdayMap[dayMatch[1].normalize('NFC')] ?? 4;
            const dayOfMonth = dayMatch[2] ? parseInt(dayMatch[2], 10) : null;
            if (dayOfMonth) {
                result.setDate(dayOfMonth);
                if (result < now) {
                    result.setMonth(result.getMonth() + 1);
                }
            }
            else {
                const currentDow = result.getDay();
                let delta = (targetDow - currentDow + 7) % 7;
                if (delta === 0)
                    delta = 7;
                result.setDate(result.getDate() + delta);
            }
        }
        if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
            const meridiem = (timeMatch[3] || '').toLowerCase();
            if (meridiem.startsWith('p') && hours < 12)
                hours += 12;
            if (meridiem.startsWith('a') && hours === 12)
                hours = 0;
            result.setHours(hours, minutes, 0, 0);
        }
        else if (dayMatch) {
            result.setHours(10, 0, 0, 0);
        }
        return result;
    }
    detectComunidad(text) {
        const patterns = [
            /(?:en|comunidad(?:\s+de)?|visit[eé]\s+(?:la\s+comunidad\s+)?|visit[oó]\s+(?:la\s+comunidad\s+)?)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚáéíóúñ\s]{1,40}?)(?:\s+con|\s+para|\s+a\s+las|[.,]|$)/i,
            /(?:vistoso|san pedro|el roble|san jos[eé](?:\s+del\s+guaviare)?)/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return (match[1] || match[0]).trim();
            }
        }
        return null;
    }
    detectCommitments(text, tipo, fecha) {
        const commitments = [];
        const lower = text.toLowerCase();
        const compromisoMatch = text.match(/compromiso[:\s]+([^.;]+)(?:[.;]|$)/i);
        if (compromisoMatch) {
            commitments.push({
                descripcion: compromisoMatch[1].trim(),
                responsable: 'Equipo territorial',
                fecha_cumplimiento: fecha.toISOString(),
            });
        }
        const entregaMatch = text.match(/entregar?\s+([^.;]+)(?:[.;]|$)/i);
        if (entregaMatch && !compromisoMatch) {
            commitments.push({
                descripcion: `Entregar ${entregaMatch[1].trim()}`,
                responsable: 'Equipo territorial',
                fecha_cumplimiento: fecha.toISOString(),
            });
        }
        if (commitments.length === 0 && (tipo === 'REUNION' || tipo === 'VISITA')) {
            commitments.push({
                descripcion: tipo === 'REUNION'
                    ? 'Confirmar asistencia y levantar acta de la reunión'
                    : 'Registrar hallazgos y seguimiento de la visita',
                responsable: 'Gestor Social Territorial',
                fecha_cumplimiento: fecha.toISOString(),
            });
        }
        if (/con la comunidad|multiactor|articulaci[oó]n/.test(lower) && commitments.length === 0) {
            commitments.push({
                descripcion: 'Articulación multiactor con la comunidad',
                responsable: 'Representante comunitario',
                fecha_cumplimiento: fecha.toISOString(),
            });
        }
        return commitments;
    }
    async classifyPriority(text) {
        const urgentWords = [
            'urgente',
            'peligro',
            'rotura',
            'emergencia',
            'inmediato',
            'crítico',
        ];
        const lowerText = text.toLowerCase();
        const isUrgent = urgentWords.some((word) => lowerText.includes(word));
        return isUrgent ? 'ALTA' : 'BAJA';
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map