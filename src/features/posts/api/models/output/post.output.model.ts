import { PostDocument } from '../../../domain/post.entity';
import { Like, LikeStatus } from '../../../../like/domain/like.entity';

// TODO: change LikeStatus to another file
class ExtendedLikesInfo {
  likesCount: number = 0;
  dislikesCount: number = 0;
  myStatus: LikeStatus = LikeStatus.None;
  newestLikes: Like[] = [];
}

export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
  constructor(extendedLikesInfo: ExtendedLikesInfo) {
    this.extendedLikesInfo = extendedLikesInfo;
  }
}

// MAPPERS

export const PostOutputModelMapper = (
  post,
  userId?: string,
): PostOutputModel => {
  const extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo();
  extendedLikesInfo.likesCount = post.likesCount;
  extendedLikesInfo.dislikesCount = post.dislikesCount;
  extendedLikesInfo.myStatus = userId
    ? post.getUserLikeStatusByUserId(userId)
    : LikeStatus.None;
  extendedLikesInfo.newestLikes = [];

  const outputModel: PostOutputModel = new PostOutputModel(extendedLikesInfo);
  console.log(post);
  outputModel.id = post.id;
  outputModel.title = post.title;
  outputModel.shortDescription = post.shortDescription;
  outputModel.content = post.content;
  outputModel.blogId = post.blogId.toString();
  outputModel.blogName = post.blogName;
  outputModel.createdAt = post.createdAt.toISOString();

  return outputModel;
};
