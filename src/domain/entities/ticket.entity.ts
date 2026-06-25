export class Ticket {
  id: string;
  title: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  workflowStateId: string;
  categoryId: string;
  userId: string;
  priority: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Campos adicionales para la vista
  categoryName?: string;
  statusName?: string;
  documents?: any[];

  constructor(props: Partial<Ticket>) {
    Object.assign(this, props);
  }
}
