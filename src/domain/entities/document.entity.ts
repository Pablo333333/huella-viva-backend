export class Document {
  id: string;
  name: string;
  url: string;
  type?: string;
  userId: string;
  ticketId?: string;
  tramiteId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Partial<Document>) {
    Object.assign(this, props);
  }
}
