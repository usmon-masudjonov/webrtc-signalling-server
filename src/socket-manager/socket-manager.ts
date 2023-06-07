import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export default class SocketManager {
  private sockets = new Map<string, Set<Socket>>();

  async addSocket(roomId: string, ws: Socket) {
    if (this.sockets.has(roomId)) {
      this.sockets.get(roomId).add(ws);
    } else {
      const set = new Set([ws]);
      this.sockets.set(roomId, set);
    }
  }

  getSocketCount(roomId: string) {
    return this.sockets.get(roomId)?.size || 0;
  }

  async removeSocket(roomId: string, ws: Socket) {
    if (this.sockets.has(roomId)) {
      const sockets = this.sockets.get(roomId);

      sockets.delete(ws);

      if (sockets.size === 0) {
        this.sockets.delete(roomId);
      }
    }
  }

  sendTo(roomId: string, event: string, payload: Record<string, any>) {
    const sockets = this.sockets.get(roomId);

    if (sockets && sockets.size > 0) {
      Array.from(sockets.values()).forEach((socket) => {
        socket.emit(event, payload);
      });
    }
  }
}
