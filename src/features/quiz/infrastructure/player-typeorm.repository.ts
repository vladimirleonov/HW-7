import { Repository } from 'typeorm';
import { Player } from '../domain/player.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class PlayerTypeormRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async save(player: Player): Promise<void> {
    await this.playerRepository.save(player);
  }
}
