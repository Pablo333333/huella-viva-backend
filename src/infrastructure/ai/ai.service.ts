import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async summarize(text: string): Promise<string> {
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

  async classifyPriority(text: string): Promise<'ALTA' | 'BAJA'> {
    const urgentWords = ['urgente', 'peligro', 'rotura', 'emergencia', 'inmediato', 'crítico'];
    const lowerText = text.toLowerCase();
    
    const isUrgent = urgentWords.some(word => lowerText.includes(urgentWords.find(w => lowerText.includes(w)) || ''));
    
    return isUrgent ? 'ALTA' : 'BAJA';
  }
}
