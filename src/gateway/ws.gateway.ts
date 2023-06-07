import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeshTopologyService } from 'src/mesh-topology/mesh-topology.service';
import SocketManager from 'src/socket-manager/socket-manager';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketIOGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly socketManager: SocketManager,
    private readonly meshTopologyService: MeshTopologyService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected:`, client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected:`, client.id);
  }

  @SubscribeMessage('join')
  handleJoinEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const numberOfParticipants = this.socketManager.getSocketCount(roomId);

    this.socketManager.addSocket(roomId, client);

    if (numberOfParticipants === 0) {
      this.meshTopologyService.createRoom(roomId).createPeer(roomId, client.id);

      this.socketManager.sendToRoom(roomId, 'room_created', { roomId });
    } else {
      this.meshTopologyService.createPeer(roomId, client.id);

      this.socketManager.sendToRoom(roomId, 'joined', { roomId });
    }
  }

  @SubscribeMessage('start_call')
  handleStartCallEvent(@MessageBody() roomId: string) {
    this.socketManager.sendToRoom(roomId, 'start_call', { roomId });
  }

  @SubscribeMessage('webrtc_offer')
  handleWebRTCOfferEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    // get all room members except client himself
    const roomMembers: Socket[] = this.socketManager.getRoomMembers(
      data.roomId,
      [client.id],
    );

    // get all peers of the client
    const peersOfThisClient = this.meshTopologyService.getPeersOfPeer(
      data.roomId,
      client.id,
    );

    // defines clients who hasn't been connected to the client
    const notConnectedClients = roomMembers.filter((socket: Socket) => {
      return !peersOfThisClient.includes(socket.id);
    });

    notConnectedClients.forEach((socket: Socket) => {
      socket.emit('webrtc_offer', data.sdp);
    });
  }

  @SubscribeMessage('webrtc_answer')
  handleWebRTCAnswerEvent(@MessageBody() data: any) {
    this.socketManager.sendToRoom(data.roomId, 'webrtc_answer', data.sdp);
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRTCICECandidateEvent(@MessageBody() data: any) {
    this.socketManager.sendToRoom(data.roomId, 'webrtc_ice_candidate', data);
  }
}
