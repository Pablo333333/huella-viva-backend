import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface ActivitySuggestions {
  tipo: 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';
  resumen: string;
  commitments: Array<{
    descripcion: string;
    responsable: string;
  }>;
}

@Injectable()
export class PredictiveService {
  private readonly logger = new Logger(PredictiveService.name);

  constructor(private readonly aiService: AiService) {}

  async analyzeActivityText(text: string): Promise<ActivitySuggestions> {
    this.logger.log('Analizando texto de actividad para sugerencias predictivas...');
    
    const prompt = `
      Analiza el siguiente texto de un reporte territorial y devuelve un objeto JSON con sugerencias:
      
      1. "tipo": Clasifica entre (REUNION, INSPECCION, VISITA, TALLER, OTRO).
      2. "resumen": Un resumen de 20 palabras de lo ocurrido.
      3. "commitments": Lista de objetos { descripcion, responsable } si se mencionan compromisos o promesas.

      Texto:
      "${text.substring(0, 2000)}"

      Responde ÚNICAMENTE con el objeto JSON.
    `;

    try {
      const response = await (this.aiService as any).openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const suggestions = JSON.parse(response.choices[0].message.content);
      return suggestions as ActivitySuggestions;
    } catch (error) {
      this.logger.error(`Error en análisis predictivo: ${error.message}`);
      return {
        tipo: 'VISITA',
        resumen: 'No se pudo analizar la actividad automáticamente.',
        commitments: []
      };
    }
  }
}
