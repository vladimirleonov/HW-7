import { LikeStatus } from '../../../../../../base/types/like-status';

class Like {
  addedAt: string;
  userId: string;
  login: string;
}

class ExtendedLikesInfo {
  likesCount: number = 0;
  dislikesCount: number = 0;
  myStatus: LikeStatus = LikeStatus.None;
  newestLikes: Like[] = [];
}

// export class PostOutputModel {
//   id: string;
//   title: string;
//   shortDescription: string;
//   content: string;
//   blogId: string;
//   blogName: string;
//   createdAt: string;
//   extendedLikesInfo: ExtendedLikesInfo;
//   constructor(extendedLikesInfo: ExtendedLikesInfo) {
//     this.extendedLikesInfo = extendedLikesInfo;
//   }
// }

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

export const PostOutputModelMapper = (post): PostOutputModel => {
  // console.log(post);

  const extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo();
  extendedLikesInfo.likesCount = post.extended_likes_info.likes_count ?? 0;
  extendedLikesInfo.dislikesCount =
    post.extended_likes_info.dislikes_count ?? 0;
  extendedLikesInfo.myStatus =
    post.extended_likes_info.my_status ?? LikeStatus.None;

  extendedLikesInfo.newestLikes = post.extended_likes_info.newest_likes
    ? post.extended_likes_info.newest_likes.map((like) => {
        // console.log('like', like);
        return {
          addedAt: like.added_at,
          userId: like.user_id.toString(),
          login: like.login,
        };
      })
    : [];

  const outputModel: PostOutputModel = new PostOutputModel(extendedLikesInfo);
  outputModel.id = post.id.toString();
  outputModel.title = post.title;
  outputModel.shortDescription = post.short_description;
  outputModel.content = post.content;
  outputModel.blogId = post.blog_id.toString();
  outputModel.blogName = post.blog_name;
  outputModel.createdAt = post.created_at;

  return outputModel;
};

// export const PostOutputModelMapper = async (
//   post,
//   userId?: string,
//   userModel?: UserModelType,
// ): Promise<PostOutputModel> => {
//   console.log(post);
//   console.log(userId);
//   const extendedLikesInfo: ExtendedLikesInfo = new ExtendedLikesInfo();
//   extendedLikesInfo.likesCount = post.likesCount;
//   extendedLikesInfo.dislikesCount = post.dislikesCount;
//   extendedLikesInfo.myStatus = userId
//     ? post.getUserLikeStatusByUserId(userId)
//     : LikeStatus.None;
//
//   const newestLikes = await post.getNewestLikes(post.id, 3, userModel);
//   extendedLikesInfo.newestLikes = newestLikes || [];
//
//   const outputModel: PostOutputModel = new PostOutputModel(extendedLikesInfo);
//   outputModel.id = post.id;
//   outputModel.title = post.title;
//   outputModel.shortDescription = post.shortDescription;
//   outputModel.content = post.content;
//   outputModel.blogId = post.blogId.toString();
//   outputModel.blogName = post.blogName;
//   outputModel.createdAt = post.createdAt.toISOString();
//
//   return outputModel;
// };
