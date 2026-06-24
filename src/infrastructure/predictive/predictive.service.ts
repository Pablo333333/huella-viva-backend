import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

export interface TramiteSuggestions {
  tipo: string;
  prioridad: 'URGENTE' | 'MEDIA' | 'BAJA';
  responsableSugerido?: string;
  resumen: string;
}

@Injectable()
export class PredictiveService {
  private readonly logger = new Logger(PredictiveService.name);

  constructor(private readonly aiService: AiService) {}

  async analyzeDocumentText(text: string): Promise<TramiteSuggestions> {
    this.logger.log('Analizando texto extraído para sugerencias predictivas...');
    
    // Usamos el AiService (OpenAI) para una clasificación más inteligente
    // En lugar de usar lógica simple de palabras clave, dejamos que el LLM decida
    const prompt = `
      Analiza el siguiente texto extraído de un documento oficial y devuelve un objeto JSON con las siguientes sugerencias para un sistema de gestión de trámites:
      
      1. "tipo": Clasifica entre (SOLICITUD, CARTA, OFICIO, INFORME).
      2. "prioridad": Clasifica entre (URGENTE, MEDIA, BAJA).
      3. "responsableSugerido": Identifica si se menciona un nombre de persona o departamento específico al que deba dirigirse.
      4. "resumen": Un resumen de 15 palabras del propósito del documento.

      Texto:
      "${text.substring(0, 2000)}" // Limitamos para no exceder tokens

      Responde ÚNICAMENTE con el objeto JSON.
    `;

    try {
      // Reutilizamos la infraestructura de OpenAI del AiService
      // Nota: Podríamos añadir un método específico en AiService, pero por ahora simulamos la llamada estructurada
      const response = await (this.aiService as any).openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const suggestions = JSON.parse(response.choices[0].message.content);
      return suggestions as TramiteSuggestions;
    } catch (error) {
      this.logger.error(`Error en análisis predictivo: ${error.message}`);
      // Fallback básico
      return {
        tipo: 'SOLICITUD',
        prioridad: 'MEDIA',
        resumen: 'No se pudo analizar el documento automáticamente.'
      };
    }
  }
}
