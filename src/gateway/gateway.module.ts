import { Module } from '@nestjs/common';
import { SocketIOGateway } from './ws.gateway';
import SocketManager from 'src/socket-manager/socket-manager';
import { SocketManagerModule } from 'src/socket-manager/socket.manager.module';
import { MeshTopologyModule } from 'src/mesh-topology/mesh-topology.manager.module';
import { MeshTopologyService } from 'src/mesh-topology/mesh-topology.service';

@Module({
  imports: [SocketManagerModule, MeshTopologyModule],
  providers: [SocketIOGateway, SocketManager, MeshTopologyService],
})
export class GatewayModule {}
