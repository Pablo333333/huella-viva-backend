export class Comment {
  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
  }

  id: string;
  content: string;
  ticketId: string | null;
  userId: string;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
  };
}
