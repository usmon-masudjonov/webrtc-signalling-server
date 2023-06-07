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

  createRoom(roomId: string): this {
    this.adjacentList[roomId] = {};
    return this;
  }

  createPeer(roomId: string, peerId: string): this {
    if (!this.adjacentList[roomId]) {
      this.adjacentList[roomId] = {};
    }

    this.adjacentList[roomId][peerId] = [];

    return this;
  }

  createConnection(roomId: string, peer1: string, peer2: string): this {
    if (!this.adjacentList[roomId]) {
      this.adjacentList[roomId] = {};
    }

    if (!this.adjacentList[roomId][peer1]) {
      this.adjacentList[roomId][peer1] = [];
    }

    if (!this.adjacentList[roomId][peer2]) {
      this.adjacentList[roomId][peer2] = [];
    }

    this.adjacentList[roomId][peer1].push(peer2);
    this.adjacentList[roomId][peer2].push(peer1);

    return this;
  }

  removeConnection(roomId: string, peer1: string, peer2: string): this {
    if (
      this.adjacentList[roomId] &&
      this.adjacentList[roomId][peer1] &&
      this.adjacentList[roomId][peer2]
    ) {
      this.adjacentList[roomId][peer1].splice(
        this.adjacentList[roomId][peer1].indexOf(peer2),
        1,
      );

      this.adjacentList[roomId][peer2].splice(
        this.adjacentList[roomId][peer2].indexOf(peer1),
        1,
      );
    }

    return this;
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
