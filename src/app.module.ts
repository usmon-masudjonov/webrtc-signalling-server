import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketManagerModule } from './socket-manager/socket.manager.module';
import { GatewayModule } from './gateway/gateway.module';
import { MeshTopologyModule } from './mesh-topology/mesh-topology.manager.module';

@Module({
  imports: [SocketManagerModule, GatewayModule, MeshTopologyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
