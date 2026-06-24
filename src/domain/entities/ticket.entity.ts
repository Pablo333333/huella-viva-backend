export class Ticket {
  id: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  workflowStateId: string;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Campos adicionales para la vista
  categoryName?: string;
  statusName?: string;

  constructor(props: Partial<Ticket>) {
    Object.assign(this, props);
  }
}
