import { IsUUID, IsNotEmpty } from 'class-validator';

export class ChangeTicketStatusDto {
  @IsUUID()
  @IsNotEmpty()
  newStateId: string;
}
