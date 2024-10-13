import { LikeStatus } from '../../../../../../base/types/like-status';

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

export const CommentOutputModelMapper = (comment): CommentOutputModel => {
  const commentatorInfo: CommentatorInfo = new CommentatorInfo();
  commentatorInfo.userId = comment.commentator_info.user_id.toString();
  commentatorInfo.userLogin = comment.commentator_info.user_login;

  const likesInfo: LikesInfo = new LikesInfo();
  likesInfo.likesCount = comment.likes_info.likes_count ?? 0;
  likesInfo.dislikesCount = comment.likes_info.dislikes_count ?? 0;
  likesInfo.myStatus = comment.likes_info.my_status ?? LikeStatus.None;

  const outputModel: CommentOutputModel = new CommentOutputModel(
    commentatorInfo,
    likesInfo,
  );

  outputModel.id = comment.id.toString();
  outputModel.content = comment.content;
  outputModel.createdAt = comment.created_at;

  return outputModel;
};
