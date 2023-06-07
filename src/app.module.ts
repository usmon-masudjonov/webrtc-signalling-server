import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketManagerModule } from './socket-manager/socket.manager.module';
import { GatewayModule } from './gateway/gateway';

@Module({
  imports: [SocketManagerModule, GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
