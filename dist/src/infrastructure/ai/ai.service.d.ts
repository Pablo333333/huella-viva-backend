export declare class AiService {
    private openai;
    constructor();
    summarize(text: string): Promise<string>;
    transcribeAudio(audioBuffer: Buffer): Promise<string>;
    parseActivity(text: string): Promise<any>;
    classifyPriority(text: string): Promise<'ALTA' | 'BAJA'>;
}
