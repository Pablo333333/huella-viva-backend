import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        roomId: string;
    }, client: Socket): {
        event: string;
        data: string;
    };
    handleLeaveRoom(data: {
        roomId: string;
    }, client: Socket): {
        event: string;
        data: string;
    };
    emitToRoom(roomId: string, event: string, payload: any): void;
}
