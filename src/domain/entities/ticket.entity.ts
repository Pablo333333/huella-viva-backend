import { Comment } from './comment.entity';
import { Document } from './document.entity';
import { TicketHistory } from './ticket-history.entity';

export class Ticket {
  constructor(partial: Partial<Ticket>) {
    Object.assign(this, partial);
  }

  id: string;
  title: string;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  workflowStateId: string;
  categoryId: string;
  userId: string;
  priority: 'BAJA' | 'MEDIA' | 'URGENTE';
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  documents?: Document[];
  history?: TicketHistory[];
  comments?: Comment[];
  statusName?: string | null;
  categoryName?: string | null;
  userName?: string | null;
}
