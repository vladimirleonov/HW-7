import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Request } from 'express';
import { RequestWithCookies } from '../../base/types/request-with-cookie';

@Injectable()
export class RequestService {
  getIpAddress = (req: RequestWithCookies | Request): string => {
    let ipAddress: string | undefined = undefined;

    // for proxy devices (load balancer ...)
    const forwardedForHeader = req.headers['x-forwarded-for'];
    // string ip(s)
    if (typeof forwardedForHeader === 'string') {
      const ips: string[] = forwardedForHeader
        .split(',')
        .map((ip) => ip.trim());
      ipAddress = ips[0];
      // array ip(s)
    } else if (Array.isArray(forwardedForHeader)) {
      ipAddress = forwardedForHeader[0];
    }

    if (!ipAddress) {
      // Type assertion to access the socket property
      ipAddress = (req as unknown as IncomingMessage).socket.remoteAddress;
    }

    // delete prefix ::ffff: for IPv4
    if (ipAddress && ipAddress.startsWith('::ffff:')) {
      ipAddress = ipAddress.replace('::ffff:', '');
    }

    return ipAddress || '';
  };
  getDeviceName = (req: RequestWithCookies): string => {
    return req.headers['user-agent'] || 'unknown';
  };
}
