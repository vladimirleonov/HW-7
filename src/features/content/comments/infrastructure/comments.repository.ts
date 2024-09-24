// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import {
//   Comment,
//   CommentDocument,
//   CommentModelType,
// } from '../domain/comments.entity';
//
// @Injectable()
// export class CommentsRepository {
//   constructor(
//     @InjectModel(Comment.name) private readonly commentModel: CommentModelType,
//   ) {}
//
//   async save(comments: CommentDocument): Promise<CommentDocument> {
//     return comments.save();
//   }
//
//   async findById(id: string): Promise<CommentDocument | null> {
//     return this.commentModel.findById(id);
//   }
//
//   async update(id: string, content): Promise<boolean> {
//     const updatedInfo = await this.commentModel.updateOne(
//       { _id: id },
//       { $set: { content } },
//     );
//     return updatedInfo.matchedCount === 1;
//   }
//
//   async deleteOne(id: string): Promise<boolean> {
//     const deletedIndo = await this.commentModel.deleteOne({
//       _id: id,
//     });
//     return deletedIndo.deletedCount === 1;
//   }
// }
