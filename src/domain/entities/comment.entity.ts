export class Comment {
  id: string;
  content: string;
  ticketId?: string;
  tramiteId?: string;
  userId: string;
  createdAt: Date;

  // Campos adicionales para la vista
  user?: {
    name?: string;
    email: string;
  };

  constructor(props: Partial<Comment>) {
    Object.assign(this, props);
  }
}
