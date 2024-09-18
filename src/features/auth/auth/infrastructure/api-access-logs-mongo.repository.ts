// import { Injectable } from '@nestjs/common';
// import {
//   ApiAccessLog,
//   ApiAccessLogDocument,
//   ApiAccessLogModelType,
// } from '../domain/api-access-log.entity';
// import { InjectModel } from '@nestjs/mongoose';
// import { getTenSeccondsAgo } from '../../../../core/utils/get-time-ten-secconds-ago';
//
// @Injectable()
// export class ApiAccessLogsMongoRepository {
//   constructor(
//     @InjectModel(ApiAccessLog.name)
//     private readonly apiAccessLog: ApiAccessLogModelType,
//   ) {}
//
//   async save(
//     apiAccessLog: ApiAccessLogDocument,
//   ): Promise<ApiAccessLogDocument> {
//     return apiAccessLog.save();
//   }
//   async countApiAccessLogsByIpAndOriginUrl(
//     ip: string,
//     originUrl: string,
//   ): Promise<number> {
//     const tenSecondsAgo: Date = getTenSeccondsAgo();
//
//     return this.apiAccessLog.countDocuments({
//       ip,
//       URL: originUrl,
//       date: {
//         $gte: tenSecondsAgo,
//       },
//     });
//   }
// }
