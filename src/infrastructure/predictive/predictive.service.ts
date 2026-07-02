import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface TicketSuggestions {
  tipo: string;
  prioridad: 'URGENTE' | 'MEDIA' | 'BAJA';
  responsableSugerido?: string;
  resumen: string;
  titulo?: string;
}

@Injectable()
export class PredictiveService {
  private readonly logger = new Logger(PredictiveService.name);

  constructor(private readonly aiService: AiService) {}

  async analyzeDocumentText(text: string): Promise<TicketSuggestions> {
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
      const response = await (this.aiService as any).openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const suggestions = JSON.parse(response.choices[0].message.content);
      return suggestions as TicketSuggestions;
    } catch (error) {
      this.logger.error(`Error en análisis predictivo: ${error.message}`);
      return {
        tipo: 'SOLICITUD',
        prioridad: 'MEDIA',
        resumen: 'No se pudo analizar el documento automáticamente.',
        titulo: 'Nuevo Ticket (OCR)'
      };
    }
  }
}
