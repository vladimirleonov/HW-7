// class ExtendedLikesInfo {
//   likesCount: number = 0;
//   dislikesCount: number = 0;
//   myStatus: LikeStatus = LikeStatus.None;
//   newestLikes: Like[] = [];
// }

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
  extendedLikesInfo: any;
  // constructor(extendedLikesInfo: ExtendedLikesInfo) {
  //   this.extendedLikesInfo = extendedLikesInfo;
  // }
}

// MAPPERS

export const PostOutputModelMapper = (post): PostOutputModel => {
  console.log(post);
  console.log(typeof post.created_at);

  const outputModel: PostOutputModel = new PostOutputModel();
  outputModel.id = post.id.toString();
  outputModel.title = post.title;
  outputModel.shortDescription = post.short_description;
  outputModel.content = post.content;
  outputModel.blogId = post.blog_id.toString();
  outputModel.blogName = post.blog_name;
  outputModel.createdAt = post.created_at;
  outputModel.extendedLikesInfo = {
    likesCount: 0,
    dislikesCount: 0,
    myStatus: 'None',
    newestLikes: [],
  };

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
