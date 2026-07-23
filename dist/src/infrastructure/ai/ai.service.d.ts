import { TerraVozParsedData } from '../../application/dtos/terra-voz.dto';
export declare class AiService {
    private readonly logger;
    private openai;
    constructor();
    summarize(text: string): Promise<string>;
    transcribeAudio(audioBuffer: Buffer): Promise<string>;
    parseActivity(text: string): Promise<TerraVozParsedData>;
    parseActivityLocally(text: string): TerraVozParsedData;
    resolveActivityFecha(text: string, parsedFecha?: string | null): string;
    private textMentionsExplicitDate;
    private detectTipo;
    private detectFecha;
    private detectComunidad;
    private detectCommitments;
    classifyPriority(text: string): Promise<'ALTA' | 'BAJA'>;
}
