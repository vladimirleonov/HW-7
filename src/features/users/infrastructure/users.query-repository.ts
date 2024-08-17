import { Injectable } from '@nestjs/common';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../../base/models/pagination.base.model';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {
    const searchLoginTermFilter: FilterQuery<User> = pagination.searchLoginTerm
      ? { login: { $regex: pagination.searchLoginTerm, $options: 'i' } }
      : {};

    const searchEmailTermFilter: FilterQuery<User> = pagination.searchEmailTerm
      ? { email: { $regex: pagination.searchEmailTerm, $options: 'i' } }
      : {};

    const orFilters: FilterQuery<User>[] = [
      searchLoginTermFilter,
      searchEmailTermFilter,
    ].filter((filter: FilterQuery<User>) => Object.keys(filter).length > 0);

    const filter = orFilters.length > 0 ? { $or: orFilters } : {};

    // const users: User[] = await UserModel.find(filter)
    //   .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
    //   .skip((query.pageNumber - 1) * query.pageSize)
    //   .limit(query.pageSize);

    // const totalCount: number = await UserModel.countDocuments(filter)
    // return {
    //   pagesCount: Math.ceil(totalCount / query.pageSize),
    //   page: query.pageNumber,
    //   pageSize: query.pageSize,
    //   totalCount,
    //   items: users.map((user: User) => this.mapToDetailedUser(user))
    // }
    return this._getResult(filter, pagination);
  }
  async findById(id: string): Promise<UserOutputModel | null> {
    const user: UserDocument = await this.userModel.findById(id);

    if (user === null) {
      return null;
    }

    return UserOutputModelMapper(user);
  }
  // TODO: change type any
  private async _getResult(
    filter: any,
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {
    // pagination: pageNumber, pageSize, sortDirection, sortBy, searchLoginTerm, searchEmailTerm
    const users: UserDocument[] = await this.userModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount: number = await this.userModel.countDocuments(filter);
    const mappedUsers: UserOutputModel[] = users.map(UserOutputModelMapper);

    return new PaginationOutput<UserOutputModel>(
      mappedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
