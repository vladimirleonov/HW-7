import { IsEnum, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/transform/trim';
import { LikeStatus } from '../../../../like/domain/like.entity';

export class PostUpdateLikeStatusModel {
  @IsString()
  @Trim()
  @Length(1, 30, { message: 'Length not correct' })
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
