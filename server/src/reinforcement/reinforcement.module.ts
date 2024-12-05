import { Module } from '@nestjs/common';
import { ReinforcementController } from './reinforcement.controller';
import { ReinforcementService } from './reinforcement.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReinforcementScheme } from './reinforcement.model';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Reinforcement', schema: ReinforcementScheme },
		]),
	],
  controllers: [ReinforcementController],
  providers: [ReinforcementService]
})
export class ReinforcementModule {}
