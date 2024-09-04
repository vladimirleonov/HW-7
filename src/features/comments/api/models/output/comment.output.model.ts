import { LikeStatus } from '../../../../like/domain/like.entity';
import { CommentDocument } from '../../../domain/comments.entity';

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus = LikeStatus.None;
}

export class CommentOutputModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
  constructor(commentatorInfo: CommentatorInfo, likesInfo: LikesInfo) {
    this.commentatorInfo = commentatorInfo;
    this.likesInfo = likesInfo;
  }
}

// Mappers

export const CommentOutputModelMapper = (
  comment: CommentDocument,
  userId: string,
): CommentOutputModel => {
  const commentatorInfo: CommentatorInfo = new CommentatorInfo();
  commentatorInfo.userId = comment.commentatorInfo.userId.toString();
  commentatorInfo.userLogin = comment.commentatorInfo.userLogin;

  const likesInfo: LikesInfo = new LikesInfo();
  likesInfo.likesCount = comment.likesCount;
  likesInfo.dislikesCount = comment.dislikesCount;
  likesInfo.myStatus = userId
    ? comment.getUserLikeStatusByUserId(userId)
    : LikeStatus.None;

  const outputModel: CommentOutputModel = new CommentOutputModel(
    commentatorInfo,
    likesInfo,
  );
  outputModel.id = comment.id;
  outputModel.content = comment.content;
  outputModel.createdAt = comment.createdAt.toISOString();

  return outputModel;
};
