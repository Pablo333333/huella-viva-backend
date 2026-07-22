import { AiService } from '../ai/ai.service';
export interface ActivitySuggestions {
    tipo: 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';
    resumen: string;
    commitments: Array<{
        descripcion: string;
        responsable: string;
    }>;
}
export declare class PredictiveService {
    private readonly aiService;
    private readonly logger;
    constructor(aiService: AiService);
    analyzeActivityText(text: string): Promise<ActivitySuggestions>;
}
