import { TicketHistory } from '../entities/ticket-history.entity';

export interface ITicketHistoryRepository {
  create(history: TicketHistory): Promise<TicketHistory>;
  findByTicketId(ticketId: string): Promise<TicketHistory[]>;
}

export const ITicketHistoryRepository = Symbol('ITicketHistoryRepository');
