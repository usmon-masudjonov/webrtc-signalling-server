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
import {
  StartCallingToNewPeerDTO,
  OfferDTO,
  ICECandidateDTO,
  AnswerDTO,
  AnswerOfferProcessCompletionDTO,
} from './dto/events.dto';

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
    console.log(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(client.id);
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

      this.socketManager.sendToRoom(roomId, 'room_created', {
        roomId,
        newPeerId: client.id,
      });
    } else {
      this.meshTopologyService.createPeer(roomId, client.id);

      const roomMembers: Socket[] = this.socketManager.getRoomMembers(roomId, [
        client.id,
      ]);

      this.server.to(client.id).emit('setup_local_stream', {
        roomId,
      });

      roomMembers.forEach((socket: Socket) => {
        socket.emit('new_peer_created', {
          roomId,
          peerTo: socket.id,
          newPeerId: client.id,
        });
      });
    }
  }

  @SubscribeMessage('webrtc_offer')
  handleWebRTCOfferEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: OfferDTO,
  ) {
    this.server.to(data.peerTo).emit('new_webrtc_offer', {
      type: data.type,
      sdp: data.sdp,
      roomId: data.roomId,
      peerFrom: data.peerFrom,
      peerTo: data.peerTo,
    });
  }

  @SubscribeMessage('webrtc_answer_to_the_offer')
  handleWebRTCAnswerEvent(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: AnswerDTO,
  ) {
    this.server.to(data.peerTo).emit('webrtc_answer_to_the_offer', {
      roomId: data.roomId,
      sdp: data.sdp,
      peerFrom: data.peerFrom,
      peerTo: data.peerTo,
    });
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRTCICECandidateEvent(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: ICECandidateDTO,
  ) {
    this.server.to(data.peerTo).emit('webrtc_ice_candidate', data);
  }

  @SubscribeMessage('webrtc_signalling_completion')
  handleWebRTCSignallingCompletionEvent(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: AnswerOfferProcessCompletionDTO,
  ) {
    this.meshTopologyService.createConnection(
      data.roomId,
      data.peerFrom,
      data.peerTo,
    );

    console.table(this.meshTopologyService.getRoom(data.roomId));
    console.log(this.meshTopologyService.getRoom(data.roomId));
  }
}
