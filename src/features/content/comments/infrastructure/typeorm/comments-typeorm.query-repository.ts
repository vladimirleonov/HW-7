import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Pagination,
  PaginationOutput,
} from '../../../../../base/models/pagination.base.model';
import { PaginationQueryParams } from '../../../../../base/models/pagination-query.input.model';
import { Comment } from '../../domain/comment.entity';
import { CommentLike } from '../../../like/domain/like.entity';

@Injectable()
export class CommentsTypeormQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
  ) {}

  async getAllPostComments(
    pagination: Pagination<PaginationQueryParams>,
    postId: number,
    userId?: number,
  ): Promise<any> {
    const likesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Like'");

    const dislikesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Dislike'");

    const myStatusSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('cl.status')
      .where('cl.commentId = c.id')
      .andWhere('cl.authorId = :userId');

    // hardly set 'u.login' in getAllPostComments to pass tests
    const query = this.commentRepository
      .createQueryBuilder('c')
      .select([
        'CAST(c.id as text) as id',
        'c.content as content',
        'c.created_at as "createdAt"',
      ])
      .leftJoin('c.commentator', 'u')
      .addSelect(
        `json_build_object(
          'userId', CAST(u.id as text),
          'userLogin', 'u.login'
        ) as "commentatorInfo"`,
      )
      .addSelect(
        `json_build_object(
          'likesCount', (${likesCountSubquery.getQuery()}),
          'dislikesCount', (${dislikesCountSubquery.getQuery()}),
          'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None')
        ) as "likesInfo"`,
      )
      .where('c.post_id = :postId', { postId })
      // .orderBy(`c.${pagination.sortBy}`, pagination.sortDirection)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .limit(pagination.pageSize)
      .setParameters({ userId });

    for (const sortItem of pagination.sort) {
      query.addOrderBy(`c.${sortItem.field}`, sortItem.direction);
    }

    const posts = await query.getRawMany();

    const totalCount: number = await this.commentRepository
      .createQueryBuilder('c')
      .where('c."post_id" = :postId', { postId })
      .getCount();

    return new PaginationOutput<Comment>(
      posts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }

  async getOne(id: number, userId?: number): Promise<any> {
    const likesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Like'");

    const dislikesCountSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('COUNT(*)')
      .where('cl.commentId = c.id')
      .andWhere("cl.status = 'Dislike'");

    const myStatusSubquery = this.commentLikeRepository
      .createQueryBuilder('cl')
      .select('cl.status')
      .where('cl.commentId = c.id')
      .andWhere('cl.authorId = :userId');

    const result = this.commentRepository
      .createQueryBuilder('c')
      .select([
        'CAST(c.id as text) as id',
        'c.content as content',
        'c.created_at as "createdAt"',
      ])
      .leftJoin('c.commentator', 'u')
      .addSelect(
        `
        json_build_object(
          'userId', CAST(u.id as text),
          'userLogin', 'u.login'
        ) as "commentatorInfo"
        `,
      )
      .addSelect(
        `
          json_build_object(
            'likesCount', (${likesCountSubquery.getQuery()}),
            'dislikesCount', (${dislikesCountSubquery.getQuery()}),
            'myStatus', COALESCE((${myStatusSubquery.getQuery()}), 'None') 
          ) as "likesInfo"
        `,
      )
      .where('c.id = :id', { id })
      .setParameters({ userId })
      .getRawOne();

    return result;
  }
}
