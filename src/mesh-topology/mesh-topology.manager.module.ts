import { Module } from '@nestjs/common';
import { MeshTopologyService } from './mesh-topology.service';

@Module({
  providers: [MeshTopologyService],
  exports: [MeshTopologyService],
})
export class MeshTopologyModule {}
