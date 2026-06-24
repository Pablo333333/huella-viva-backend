export class TicketHistory {
  id: string;
  ticketId: string;
  oldStateId?: string;
  newStateId: string;
  userId: string;
  timestamp: Date;

  // Campos adicionales para la vista
  user?: {
    name?: string;
    email: string;
  };

  constructor(props: Partial<TicketHistory>) {
    Object.assign(this, props);
  }
}
