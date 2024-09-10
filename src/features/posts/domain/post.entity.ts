import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Like, LikeSchema, LikeStatus } from '../../like/domain/like.entity';
import { UserModelType } from '../../users/domain/user.entity';

@Schema()
export class Post {
  @Prop({
    type: String,
    maxlength: 30,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    maxlength: 100,
    required: true,
  })
  shortDescription: string;

  @Prop({
    type: String,
    maxlength: 1000,
    required: true,
  })
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  blogId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    maxlength: 1000,
    required: true,
  })
  blogName: string;

  @Prop({
    type: [LikeSchema],
    required: true,
  })
  likes: Like[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    required: true,
  })
  likesCount: number;

  @Prop({
    type: Number,
    default: 0,
    required: true,
  })
  dislikesCount: number;

  @Prop({
    type: Date,
    // validate: {
    //   validator: isValidISOString,
    //   message: "createdAt must be a valid ISO string",
    // },
    required: true,
  })
  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods.updateLikeStatus = function (
  userId: string,
  likeStatus: LikeStatus,
): void {
  const post = this as PostDocument;

  // get use like
  const userLike: Like | undefined = post.likes.find(
    (like) => like.authorId.toString() === userId,
  );

  // add like to comment likes
  if (!userLike) {
    // console.log("!userLike")
    // for input.likeStatus = None
    if (likeStatus === LikeStatus.None) {
      return;
    }
    // input.likeStatus = (LikeStatus.Like || LikeStatus.Dislike)
    // const likeToAdd: Like = new Like(
    //   new Date().toISOString(),
    //   likeStatus,
    //   userId,
    // );
    // post.likes.push(likeToAdd);

    post.likes.push({
      createdAt: new Date(),
      status: likeStatus,
      authorId: new mongoose.Types.ObjectId(userId),
    });

    // for input.likeStatus = LikeStatus.Like
    if (likeStatus === LikeStatus.Like) post.likesCount += 1;
    // for input.likeStatus = LikeStatus.Dislike
    if (likeStatus === LikeStatus.Dislike) post.dislikesCount += 1;

    // await this.postMongoRepository.save(post)
    return;
  }
  // Existing like with same status
  if (userLike.status === likeStatus) {
    // console.log("nothing change")
    return;
  }
  // Existing like with status None
  if (likeStatus === LikeStatus.None) {
    // console.log("None")
    post.likes = post.likes.filter(
      (like: Like) => like.authorId.toString() !== userId,
    );
    // was dislike
    if (userLike.status === LikeStatus.Dislike) post.dislikesCount -= 1;
    // was like
    if (userLike.status === LikeStatus.Like) post.likesCount -= 1;
  }
  // Existing like with different status Like
  if (likeStatus === LikeStatus.Like) {
    // console.log("Like")
    // was dislike
    if (userLike.status === LikeStatus.Dislike) post.dislikesCount -= 1;
    post.likesCount += 1;

    userLike.status = likeStatus;
    userLike.createdAt = new Date();
  }
  // Existing like with different status Dislike
  if (likeStatus === LikeStatus.Dislike) {
    // console.log("Dislike")
    // was like
    if (userLike.status === LikeStatus.Like) post.likesCount -= 1;
    post.dislikesCount += 1;

    userLike.status = likeStatus;
    userLike.createdAt = new Date();
  }

  return;
};

PostSchema.methods.getUserLikeStatusByUserId = function (
  userId?: string,
): LikeStatus {
  // console.log("in getUserLikeStatusByUserId", userId)
  if (!userId) return LikeStatus.None;
  const userLike = this.likes.find(
    (like: Like): boolean => like.authorId.toString() === userId,
  );
  // console.log("userLike", userLike)
  return userLike ? userLike.status : LikeStatus.None;
};

export class NewestLike {
  constructor(
    public addedAt: string,
    public userId: mongoose.Types.ObjectId,
    public login: string,
  ) {}
}

PostSchema.methods.getNewestLikes = async function (
  postId: string,
  count: number,
  userModel: UserModelType,
): Promise<NewestLike[]> {
  //const likes = await this.likes.find().sort({createdAt: -1}).limit(count)
  const likes = this.likes
    //.slice()
    .filter((like) => like.status === LikeStatus.Like)
    .sort((a: Like, b: Like) =>
      b.createdAt.toISOString().localeCompare(a.createdAt.toISOString()),
    )
    .slice(0, count);

  if (likes.length === 0) return [];
  console.log('likes', likes);

  const userIds = likes.map((like: Like) => like.authorId);
  console.log('userIds', userIds);

  const users = await userModel.find({ _id: { $in: userIds } });
  console.log('users', users);

  return likes.map((like: Like): NewestLike => {
    const user = users.find(
      (u) => u._id.toString() === like.authorId.toString(),
    );
    console.log('user map', user);
    return {
      addedAt: like.createdAt.toISOString(),
      userId: like.authorId,
      login: user ? user.login : 'Unknown',
    };
  });
};

export type PostDocument = HydratedDocument<Post> & {
  updateLikeStatus(userId: string, likeStatus: LikeStatus): void;
  getUserLikeStatusByUserId(userId?: string): LikeStatus;
  getNewestLikes(
    postId: string,
    count: number,
    userModel: UserModelType,
  ): Promise<NewestLike[]>;
};

// export class Like {
//   constructor(
//     public createdAt: string,
//     public status: LikeStatus,
//     public authorId: string
//   ) {
//   }
// }

// export class NewestLike {
//   constructor(
//     public addedAt: string,
//     public userId: string,
//     public login: string
//   ) {
//   }
// }

// export class Post {
//   constructor(
//     public _id: ObjectId,
//     public title: string,
//     public shortDescription: string,
//     public content: string,
//     public blogId: ObjectId,
//     public blogName: string,
//     public likes: Like[],
//     public likesCount: number,
//     public dislikesCount: number,
//     public createdAt: string,
//   ) {
//   }
//
//   getUserLikeStatusByUserId(userId: string): LikeStatus {
//     throw new Error("Method implemented in schema")
//   }
//
//   getNewestLikes(postId: ObjectId, count: number): Promise<NewestLike[]> {
//     throw new Error("Method implemented in schema")
//   }
//
//   updateLikeStatus(userId: string, likeStatus: LikeStatus): void {
//     throw new Error("Method implemented in schema")
//   }
// }

// const postSchema = new mongoose.Schema<Post>({});

// postSchema.methods.getUserLikeStatusByUserId = function (userId?: string): LikeStatus {
//   // console.log("in getUserLikeStatusByUserId", userId)
//   if (!userId) return LikeStatus.None
//   const userLike = this.likes.find((like: Like): boolean => like.authorId === userId)
//   // console.log("userLike", userLike)
//   return userLike ? userLike.status : LikeStatus.None
// }
//
// postSchema.methods.getNewestLikes = async function (postId: ObjectId, count: number): Promise<NewestLike[]> {
//   //const likes = await this.likes.find().sort({createdAt: -1}).limit(count)
//   const likes = this.likes.slice().sort((a: Like, b: Like) => b.createdAt.localeCompare(a.createdAt)).slice(0, count)
//   if (likes.length === 0) return []
//
//   const userIds = likes.map((like: Like) => like.authorId)
//   const users = await UserModel.find({_id: {$in: userIds}})
//
//   return this.likes.map((like: Like): NewestLike => {
//     const user = users.find(u => u._id.toString() === like.authorId.toString())
//     return {
//       addedAt: like.createdAt,
//       userId: like.authorId,
//       login: user ? user.login : 'Unknown'
//     }
//   })
// }

//
// export const PostModel = mongoose.model<Post>('Post', postSchema)
