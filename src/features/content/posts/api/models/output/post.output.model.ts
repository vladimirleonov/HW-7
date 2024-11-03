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
