export declare class AiService {
    private openai;
    constructor();
    summarize(text: string): Promise<string>;
    classifyPriority(text: string): Promise<'ALTA' | 'BAJA'>;
}
