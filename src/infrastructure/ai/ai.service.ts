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
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres un asistente experto en gestión documental. Resume la siguiente conversación en máximo 100 palabras." },
        { role: "user", content: text }
      ],
    });

    return response.choices[0].message.content || 'No se pudo generar el resumen.';
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return "Transcripción simulada: El día de hoy visitamos la comunidad de El Roble para revisar el avance del pozo de agua.";
    }

    // Convert Buffer to File-like object for OpenAI API if necessary, 
    // but the SDK handles streams/buffers.
    const transcription = await this.openai.audio.transcriptions.create({
      file: await OpenAI.toFile(audioBuffer, 'audio.mp3'),
      model: "whisper-1",
    });

    return transcription.text;
  }

  async parseActivity(text: string): Promise<any> {
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

  async classifyPriority(text: string): Promise<'ALTA' | 'BAJA'> {
    const urgentWords = ['urgente', 'peligro', 'rotura', 'emergencia', 'inmediato', 'crítico'];
    const lowerText = text.toLowerCase();
    
    const isUrgent = urgentWords.some(word => lowerText.includes(urgentWords.find(w => lowerText.includes(w)) || ''));
    
    return isUrgent ? 'ALTA' : 'BAJA';
  }
}
