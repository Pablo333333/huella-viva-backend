import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { TerraVozParsedData } from '../../application/dtos/terra-voz.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async summarize(text: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return 'IA: (Simulación) Resumen territorial generado localmente para la feria.';
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente experto en gestión documental. Resume la siguiente conversación en máximo 100 palabras.',
        },
        { role: 'user', content: text },
      ],
    });

    return (
      response.choices[0].message.content ||
      'No se pudo generar el resumen.'
    );
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn(
        'OPENAI_API_KEY ausente: devolviendo transcripción simulada.',
      );
      return 'Hoy visité la comunidad El Roble para revisar el avance del pozo de agua. Compromiso: entregar 50 metros de tubería el próximo jueves.';
    }

    const transcription = await this.openai.audio.transcriptions.create({
      file: await OpenAI.toFile(audioBuffer, 'audio.m4a'),
      model: 'whisper-1',
    });

    return transcription.text;
  }

  /**
   * Parser instantáneo (heurístico local). Usado en preview para no bloquear
   * al usuario con GPT. Whisper sigue usándose solo para transcribir audio.
   */
  parseActivityFast(text: string): TerraVozParsedData {
    return this.parseActivityLocally(text);
  }

  async parseActivity(text: string): Promise<TerraVozParsedData> {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn(
        'OPENAI_API_KEY ausente: usando parser local de lenguaje natural.',
      );
      return this.parseActivityLocally(text);
    }

    const todayIso = new Date().toISOString();
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Actúa como un parser de lenguaje natural para gestión social territorial en Colombia.
Hoy es ${todayIso}.
Extrae la siguiente información del texto en formato JSON estricto:
- tipo: Uno de [REUNION, INSPECCION, VISITA, TALLER, OTRO]
- descripcion: Resumen claro de lo ocurrido o lo planificado
- fecha: SOLO si el texto menciona una fecha explícita (hoy, mañana, día de la semana, día del mes, etc.). Si NO hay fecha, usa exactamente: ${todayIso}
- estado: PROGRAMADA si es futura/planificada; EJECUTADA si ya ocurrió
- comunidadNombre: SOLO si el texto menciona explícitamente una comunidad/territorio. Si no se menciona, usa null. NUNCA inventes nombres (prohibido usar Santa Cruz u otros valores por defecto).
- commitments: SOLO compromisos explícitos en el texto. Si no hay, devuelve [].
No completes datos que no estén en el mensaje.`,
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(
      response.choices[0].message.content || '{}',
    ) as TerraVozParsedData;

    const fecha = this.resolveActivityFecha(text, parsed.fecha);
    return {
      tipo: parsed.tipo || 'OTRO',
      descripcion: parsed.descripcion || text,
      fecha,
      estado: parsed.estado || this.detectEstado(text, fecha),
      comunidadNombre: parsed.comunidadNombre || null,
      commitments: Array.isArray(parsed.commitments)
        ? parsed.commitments
        : [],
    };
  }

  /**
   * Parser heurístico para demos de feria sin OpenAI.
   * Cubre frases como:
   * - "Jueves 25 a las 10 am reunión en Vistoso con la comunidad"
   * - "Hoy visité San Pedro"
   */
  parseActivityLocally(text: string): TerraVozParsedData {
    const lower = text.toLowerCase();
    const tipo = this.detectTipo(lower);
    const fecha = this.detectFecha(text, lower);
    const fechaIso = this.resolveActivityFecha(text, fecha.toISOString());
    const comunidadNombre = this.detectComunidad(text);
    const commitments = this.detectCommitments(text, tipo, fecha);

    return {
      tipo,
      descripcion: text.trim(),
      fecha: fechaIso,
      estado: this.detectEstado(text, fechaIso),
      comunidadNombre: comunidadNombre ?? undefined,
      commitments,
    };
  }

  detectEstado(text: string, fechaIso?: string | null): 'PROGRAMADA' | 'EJECUTADA' {
    const lower = text.toLowerCase();
    const fecha = fechaIso ? new Date(fechaIso) : null;
    const now = new Date();

    const pastWords =
      /\b(visit[eé]|visit[oó]|estuvimos|estuve|se realiz[oó]|hicimos|hicimos|registr[eé]|cumplimos|hoy visité|ya se)\b/;
    const futureWords =
      /\b(se realizar[aá]|vamos a|se har[aá]|programad[oa]|pr[oó]xim[oa]|el pr[oó]ximo|mañana|queda pendiente|se program[oó])\b/;

    if (fecha && !Number.isNaN(fecha.getTime()) && fecha.getTime() > now.getTime() + 60 * 60 * 1000) {
      return 'PROGRAMADA';
    }
    if (futureWords.test(lower) && !pastWords.test(lower)) {
      return 'PROGRAMADA';
    }
    if (pastWords.test(lower)) {
      return 'EJECUTADA';
    }
    if (fecha && fecha.getTime() > now.getTime()) {
      return 'PROGRAMADA';
    }
    return 'EJECUTADA';
  }

  /**
   * Si el usuario no menciona fecha, siempre usa hoy.
   * También corrige años alucinados por el modelo (p.ej. 2023).
   */
  resolveActivityFecha(text: string, parsedFecha?: string | null): string {
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

  private textMentionsExplicitDate(text: string): boolean {
    const lower = text.toLowerCase();
    return (
      /\bhoy\b/.test(lower) ||
      /\bmañana\b/.test(lower) ||
      /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/.test(
        lower,
      ) ||
      /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/.test(lower) ||
      /\b(?:el\s+)?\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/.test(
        lower,
      ) ||
      /\b\d{1,2}\s+a\s+las\b/.test(lower)
    );
  }

  private detectTipo(
    lower: string,
  ): TerraVozParsedData['tipo'] {
    if (/reuni[oó]n|encuentro|asamblea/.test(lower)) return 'REUNION';
    if (/inspecci[oó]n|revisi[oó]n t[eé]cnica|verificar/.test(lower))
      return 'INSPECCION';
    if (/taller|capacitaci[oó]n|formaci[oó]n/.test(lower)) return 'TALLER';
    if (/visit[eé]|visit[oó]|visité|estuve en|fuimos a/.test(lower))
      return 'VISITA';
    return 'OTRO';
  }

  private detectFecha(text: string, lower: string): Date {
    const now = new Date();

    // Sin fecha explícita → hoy
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

    const dayMatch = lower.match(
      /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b(?:\s+(\d{1,2}))?/,
    );
    const timeMatch = lower.match(
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.?\s*m\.?|p\.?\s*m\.?)/,
    );

    const result = new Date(now);

    if (dayMatch) {
      const weekdayMap: Record<string, number> = {
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
      } else {
        const currentDow = result.getDay();
        let delta = (targetDow - currentDow + 7) % 7;
        if (delta === 0) delta = 7;
        result.setDate(result.getDate() + delta);
      }
    }

    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = (timeMatch[3] || '').toLowerCase();
      if (meridiem.startsWith('p') && hours < 12) hours += 12;
      if (meridiem.startsWith('a') && hours === 12) hours = 0;
      result.setHours(hours, minutes, 0, 0);
    } else if (dayMatch) {
      result.setHours(10, 0, 0, 0);
    }

    return result;
  }

  private detectComunidad(text: string): string | null {
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

  private detectCommitments(
    text: string,
    _tipo: TerraVozParsedData['tipo'],
    fecha: Date,
  ): TerraVozParsedData['commitments'] {
    const commitments: TerraVozParsedData['commitments'] = [];

    const compromisoMatch = text.match(
      /compromiso[:\s]+([^.;]+)(?:[.;]|$)/i,
    );
    if (compromisoMatch) {
      commitments.push({
        descripcion: compromisoMatch[1].trim(),
        responsable: 'Equipo territorial',
        fecha_cumplimiento: fecha.toISOString(),
      });
    }

    const entregaMatch = text.match(
      /entregar?\s+([^.;]+)(?:[.;]|$)/i,
    );
    if (entregaMatch && !compromisoMatch) {
      commitments.push({
        descripcion: `Entregar ${entregaMatch[1].trim()}`,
        responsable: 'Equipo territorial',
        fecha_cumplimiento: fecha.toISOString(),
      });
    }

    return commitments;
  }

  async classifyPriority(text: string): Promise<'ALTA' | 'BAJA'> {
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
}
