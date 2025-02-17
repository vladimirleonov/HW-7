// import { Injectable } from '@nestjs/common';
// import { DataSource } from 'typeorm';
//
// @Injectable()
// export class DevicesPostgresRepository {
//   constructor(private readonly dataSource: DataSource) {}
//
//   async deleteOneByDeviceIdAndIAt(
//     deviceId: string,
//     iat: string,
//   ): Promise<boolean> {
//     const query: string = `
//       DELETE FROM device WHERE device_id = $1 AND iat = $2
//     `;
//
//     const result = await this.dataSource.query(query, [deviceId, iat]);
//
//     const deletedRows: number = result[1];
//
//     return deletedRows > 0;
//   }
//
//   async findByDeviceId(deviceId: string): Promise<any> {
//     const query: string = `
//       SELECT * FROM device
//       WHERE device_id = $1
//     `;
//
//     const result = await this.dataSource.query(query, [deviceId]);
//
//     return result.length > 0 ? result[0] : null;
//   }
//
//   async findOneByDeviceIdAndIat(deviceId: string, iat: string): Promise<any> {
//     const query: string = `
//       SELECT * FROM device
//       WHERE device_id = $1 AND iat = $2
//     `;
//
//     const result = await this.dataSource.query(query, [deviceId, iat]);
//
//     return result.length > 0 ? result[0] : null;
//   }
//
//   async create(
//     userId: number,
//     deviceId: string,
//     iat: string,
//     deviceName: string,
//     ip: string,
//     exp: string,
//   ) {
//     const query: string = `
//       INSERT INTO device(user_id, device_id, iat, device_name, ip, exp)
//       VALUES ($1, $2, $3, $4, $5, $6)
//     `;
//
//     const result = await this.dataSource.query(query, [
//       userId,
//       deviceId,
//       iat,
//       deviceName,
//       ip,
//       exp,
//     ]);
//
//     return result.length > 0 ? result[0] : null;
//   }
//
//   async updateIat(deviceId: string, iat: string): Promise<any> {
//     const query: string = `
//       UPDATE device
//       SET iat=$1
//       WHERE device_id = $2
//     `;
//
//     const result = await this.dataSource.query(query, [iat, deviceId]);
//
//     const updatedRows = result[1];
//
//     return updatedRows > 0;
//   }
//
//   async deleteAllOtherByDeviceIdAndUserId(
//     deviceId: string,
//     userId: number,
//   ): Promise<any> {
//     const query: string = `
//       DELETE FROM device
//       WHERE device_id <> $1 AND user_id = $2
//     `;
//
//     const result = await this.dataSource.query(query, [deviceId, userId]);
//
//     const deletedRowsCount: number = result[1];
//
//     return deletedRowsCount > 0;
//   }
//
//   async deleteOneByDeviceIdAndUserId(
//     deviceId: string,
//     userId: number,
//   ): Promise<boolean> {
//     const query: string = `
//       DELETE FROM device
//       WHERE device_id = $1 AND user_id = $2
//     `;
//
//     const result = await this.dataSource.query(query, [deviceId, userId]);
//
//     const deletedRowsCount: number = result[1];
//
//     return deletedRowsCount > 0;
//   }
// }
