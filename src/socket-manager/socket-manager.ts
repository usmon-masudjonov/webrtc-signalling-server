import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export default class SocketManager {
  private sockets = new Map<string, Set<Socket>>();

  getRoomMemberIds(roomId: string, except?: string[]): string[] {
    const ids = [];

    this.sockets.get(roomId).forEach((socket: Socket) => {
      if (!except.includes(socket.id)) {
        ids.push(socket.id);
      }
    });

    return ids;
  }

  getRoomMembers(roomId: string, except?: string[]): Socket[] {
    const members = [];

    this.sockets.get(roomId).forEach((socket: Socket) => {
      if (!except.includes(socket.id)) {
        members.push(socket);
      }
    });

    return members;
  }

  async addSocket(roomId: string, ws: Socket) {
    if (this.sockets.has(roomId)) {
      const room = this.sockets.get(roomId);

      if (!room.has(ws)) {
        room.add(ws);
      }
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

  sendToRoom(roomId: string, event: string, payload: Record<string, any>) {
    const sockets = this.sockets.get(roomId);

    if (sockets && sockets.size > 0) {
      Array.from(sockets.values()).forEach((socket) => {
        socket.emit(event, payload);
      });
    }
  }
}
