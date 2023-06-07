import { Injectable } from '@nestjs/common';

type AdjacentList = {
  [k: string]: PeersOfRoom;
};

type PeersOfRoom = {
  [k: string]: PeersOfPeer;
};

type PeersOfPeer = string[];

@Injectable()
export class MeshTopologyService {
  private readonly adjacentList: AdjacentList = {};

  addConnection(roomId: string, peer1: string, peer2: string | string[]): void {
    if (!this.adjacentList[roomId]) {
      this.adjacentList[roomId] = {};
    }

    if (!this.adjacentList[roomId][peer1]) {
      this.adjacentList[roomId][peer1] = [];
    }

    if (Array.isArray(peer2)) {
      this.adjacentList[roomId][peer1] = [
        ...this.adjacentList[roomId][peer1],
        ...peer2,
      ];
    } else {
      this.adjacentList[roomId][peer1].push(peer2);
    }
  }

  removeConnection(roomId: string, peer1: string, peer2: string): void {
    if (this.adjacentList[roomId] && this.adjacentList[roomId][peer1]) {
      this.adjacentList[roomId][peer1].splice(
        this.adjacentList[roomId][peer1].indexOf(peer2),
        1,
      );
    }
  }

  getRoom(roomId: string): PeersOfRoom {
    return this.adjacentList[roomId] || {};
  }

  getPeersOfPeer(roomId: string, peerId: string): PeersOfPeer {
    if (Object.values(this.getRoom(roomId)).length === 0) {
      return [];
    }

    return this.adjacentList[roomId][peerId];
  }
}
