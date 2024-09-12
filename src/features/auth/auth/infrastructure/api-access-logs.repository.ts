import { Injectable } from '@nestjs/common';
import {
  ApiAccessLog,
  ApiAccessLogDocument,
  ApiAccessLogModelType,
} from '../domain/api-access-log.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ApiAccessLogsRepository {
  constructor(
    @InjectModel(ApiAccessLog.name)
    private readonly apiAccessLog: ApiAccessLogModelType,
  ) {}

  async save(
    apiAccessLog: ApiAccessLogDocument,
  ): Promise<ApiAccessLogDocument> {
    return apiAccessLog.save();
  }
  async countApiAccessLogsByIpAndOriginUrl(
    ip: string,
    originUrl: string,
  ): Promise<number> {
    // TODO: put it in util function
    const tenSecondsAgo: Date = new Date(new Date().getTime() - 10000);

    return this.apiAccessLog.countDocuments({
      ip,
      URL: originUrl,
      date: {
        $gte: tenSecondsAgo,
      },
    });
  }
}
