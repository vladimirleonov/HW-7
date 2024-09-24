// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Blog, BlogDocument } from '../../domain/blog.entity';
// import { FilterQuery, Model } from 'mongoose';
// import {
//   PaginationOutput,
//   PaginationWithSearchNameTerm,
// } from '../../../../../base/models/pagination.base.model';
// import {
//   BlogOutputModel,
//   BlogOutputModelMapper,
// } from '../../api/models/output/blog.output.model';
//
// @Injectable()
// export class BlogsMongoQueryRepository {
//   constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}
//
//   async getAll(
//     pagination: PaginationWithSearchNameTerm,
//   ): Promise<PaginationOutput<BlogOutputModel>> {
//     const searchNameTermFilter: FilterQuery<Blog> = pagination.searchNameTerm
//       ? { name: { $regex: pagination.searchNameTerm, $options: 'i' } }
//       : {};
//
//     const orFilters: FilterQuery<Blog>[] = [searchNameTermFilter].filter(
//       (filter: FilterQuery<Blog>) => Object.keys(filter).length > 0,
//     );
//
//     const filter = orFilters.length > 0 ? { $or: orFilters } : {};
//
//     return this._getResult(filter, pagination);
//   }
//
//   // TODO: change type any
//   async _getResult(
//     filter: any,
//     pagination: PaginationWithSearchNameTerm,
//   ): Promise<PaginationOutput<BlogOutputModel>> {
//     const blogs: BlogDocument[] = await this.blogModel
//       .find(filter)
//       .sort({
//         [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
//       })
//       .skip(pagination.getSkipItemsCount())
//       .limit(pagination.pageSize);
//
//     const totalCount: number = await this.blogModel.countDocuments(filter);
//     const mappedBlogs: BlogOutputModel[] = blogs.map(BlogOutputModelMapper);
//
//     return new PaginationOutput<BlogOutputModel>(
//       mappedBlogs,
//       pagination.pageNumber,
//       pagination.pageSize,
//       totalCount,
//     );
//   }
//
//   async findById(id: string): Promise<BlogOutputModel | null> {
//     const blog: BlogDocument | null = await this.blogModel.findById(id);
//
//     if (blog === null) {
//       return null;
//     }
//
//     return BlogOutputModelMapper(blog);
//   }
// }
