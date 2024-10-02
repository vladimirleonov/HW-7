import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CommentLikesPostgresRepository {
  constructor(@InjectDataSource() dataSource: DataSource) {}

  async findById(commentId: number, userId: number) {}
}
