import { Module } from '@nestjs/common';
import { SocketIOGateway } from './ws.gateway';
import SocketManager from 'src/socket-manager/socket-manager';
import { SocketManagerModule } from 'src/socket-manager/socket.manager.module';

@Module({
  imports: [SocketManagerModule],
  providers: [SocketIOGateway, SocketManager],
})
export class GatewayModule {}
