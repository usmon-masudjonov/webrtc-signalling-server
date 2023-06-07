import { Module } from '@nestjs/common';
import SocketManager from './socket-manager';

@Module({
  providers: [SocketManager],
  exports: [SocketManager],
})
export class SocketManagerModule {}
