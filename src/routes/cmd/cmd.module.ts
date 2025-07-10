import { Module } from '@nestjs/common';
import { CmdController } from './cmd.controller';
import { CmdService } from './cmd.service';

@Module({
  controllers: [CmdController],
  providers: [CmdService],
  exports: [CmdService],
})
export class CmdModule {}