import { AiService } from '../ai/ai.service';
export interface TramiteSuggestions {
    tipo: string;
    prioridad: 'URGENTE' | 'MEDIA' | 'BAJA';
    responsableSugerido?: string;
    resumen: string;
}
export declare class PredictiveService {
    private readonly aiService;
    private readonly logger;
    constructor(aiService: AiService);
    analyzeDocumentText(text: string): Promise<TramiteSuggestions>;
}
