export class TicketHistory {
  id: string;
  ticketId: string;
  oldStateId: string | null;
  newStateId: string;
  userId: string;
  timestamp: Date;

  // Campos adicionales para la vista
  user?: {
    name: string | null;
    email: string;
  };

  constructor(props: Partial<TicketHistory>) {
    Object.assign(this, props);
  }
}
