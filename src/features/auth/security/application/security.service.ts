import { Injectable } from '@nestjs/common';
import { Result } from '../../../../base/types/object-result';
import {
  ApiAccessLog,
  ApiAccessLogDocument,
  ApiAccessLogModelType,
} from '../../auth/domain/api-access-log.entity';
// import { ApiAccessLogsMongoRepository } from '../../auth/infrastructure/api-access-logs-mongo.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SecurityService {
  constructor() {} //private apiAccessLogModel: ApiAccessLogModelType, //@InjectModel(ApiAccessLog.name) //private readonly apiAccessLogsRepository: ApiAccessLogsMongoRepository,
  async checkRateLimit(ip: string, originUrl: string): Promise<any> {
    // const accessLogsCount: number =
    //   await this.apiAccessLogsRepository.countApiAccessLogsByIpAndOriginUrl(
    //     ip,
    //     originUrl,
    //   );
    //
    // if (accessLogsCount >= 5) {
    //   return Result.tooManyRequests(`Too many requests`);
    // }
    //
    // const newApiAccessLog: ApiAccessLogDocument = new this.apiAccessLogModel({
    //   ip,
    //   URL: originUrl,
    //   date: new Date(),
    // });
    //
    // await this.apiAccessLogsRepository.save(newApiAccessLog);
    //
    // return Result.success();
  }
}
