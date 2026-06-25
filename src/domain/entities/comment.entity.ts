export class Comment {
  id: string;
  content: string;
  ticketId: string | null;
  tramiteId: string | null;
  userId: string;
  createdAt: Date;

  // Campos adicionales para la vista
  user?: {
    name: string | null;
    email: string;
  };

  constructor(props: Partial<Comment>) {
    Object.assign(this, props);
  }
}
