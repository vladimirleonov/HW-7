import { Repository } from 'typeorm';
import { Player } from '../domain/player.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class PlayerTypeormQueryRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerQueryRepository: Repository<Player>,
  ) {}

  async checkPlayerExistsById(playerId: number): Promise<boolean> {
    const player: Player | null = await this.playerQueryRepository.findOneBy({
      id: playerId,
    });

    return !!player;
  }

  async checkPlayerExistsByUserId(userId: number): Promise<boolean> {
    const player: Player | null = await this.playerQueryRepository.findOneBy({
      userId: userId,
    });

    return !!player;
  }
}
