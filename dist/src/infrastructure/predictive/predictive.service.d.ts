import { AiService } from '../ai/ai.service';
export interface TicketSuggestions {
    tipo: string;
    prioridad: 'URGENTE' | 'MEDIA' | 'BAJA';
    responsableSugerido?: string;
    resumen: string;
    titulo?: string;
}
export declare class PredictiveService {
    private readonly aiService;
    private readonly logger;
    constructor(aiService: AiService);
    analyzeDocumentText(text: string): Promise<TicketSuggestions>;
}
