import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
export declare class GenerateDocumentUseCase {
    private readonly ticketRepository;
    constructor(ticketRepository: ITicketRepository);
    execute(ticketId: string): Promise<Buffer>;
}
