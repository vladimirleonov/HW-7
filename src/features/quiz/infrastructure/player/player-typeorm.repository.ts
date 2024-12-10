import { Repository } from 'typeorm';
import { Player, PlayerStatus } from '../../domain/player.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class PlayerTypeormRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async save(player: Player): Promise<void> {
    await this.playerRepository.save(player);
  }

  async getOne(userId: number): Promise<Player | null> {
    return this.playerRepository.findOneBy({
      userId: userId,
      status: PlayerStatus.InProgress,
    });
  }
}
