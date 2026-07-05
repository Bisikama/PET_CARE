import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { map, Observable } from 'rxjs';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T> | any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseFormat<T> | any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: any) => {
        // 1. Nếu response đã được gửi trực tiếp (ví dụ: dùng res.send, res.end...)
        // hoặc dữ liệu là StreamableFile (tải file) thì giữ nguyên không wrap JSON
        if (response.headersSent || data instanceof StreamableFile) {
          return data;
        }

        let message = 'Success';
        let responseData = data;

        // 2. Tự động bóc tách và đưa custom message lên top-level nếu có
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if ('message' in data && typeof data.message === 'string') {
            message = data.message;
            
            // Tách trường message ra khỏi data thực tế để tránh trùng lặp
            const { message: _, ...rest } = data;
            responseData = Object.keys(rest).length > 0 ? rest : null;
          }
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: responseData ?? null,
        };
      }),
    );
  }
}
