import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log detailed exception on the server
    console.error('[DATABASE EXCEPTION]:', exception);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal database error';

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = Array.isArray(exception.meta?.target)
          ? (exception.meta.target as string[])
          : [];
        message =
          target.length > 0
            ? `Unique constraint failed on field: ${target.join(', ')}`
            : 'Unique constraint failed';
        break;
      }
      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message =
          typeof exception.meta?.cause === 'string' ? exception.meta.cause : 'Record not found';
        break;
      default:
        // Do not leak exception.message to the client
        message = 'An unexpected database error occurred';
        break;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: 'DatabaseError',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
