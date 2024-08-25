import { Injectable } from '@nestjs/common';
import { Result, ResultStatus } from '../../../base/types/object-result';
import {
  ApiAccessLog,
  ApiAccessLogDocument,
  ApiAccessLogModelType,
} from '../../auth/domain/api-access-log.entity';
import { ApiAccessLogsRepository } from '../../auth/infrastructure/api-access-logs.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SecurityService {
  constructor(
    private readonly apiAccessLogsRepository: ApiAccessLogsRepository,
    @InjectModel(ApiAccessLog.name)
    private apiAccessLogModel: ApiAccessLogModelType,
  ) {}
  async checkRateLimit(ip: string, originUrl: string): Promise<Result> {
    const accessLogsCount: number =
      await this.apiAccessLogsRepository.countApiAccessLogsByIpAndOriginUrl(
        ip,
        originUrl,
      );

    if (accessLogsCount >= 5) {
      return {
        status: ResultStatus.TooManyRequests,
        extensions: [{ field: 'requests', message: `Too many requests` }],
        data: null,
      };
    }

    const newApiAccessLog: ApiAccessLogDocument = new this.apiAccessLogModel({
      ip,
      URL: originUrl,
      date: new Date(),
    });

    await this.apiAccessLogsRepository.save(newApiAccessLog);
    //await apiAccessLogsMongoRepository.createApiAccessLog({ip, originUrl})

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
}
