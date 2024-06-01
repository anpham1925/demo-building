import { HttpException, HttpStatus } from '@nestjs/common';

export const customThrowError = (
  message: string,
  code: HttpStatus,
  detail?: string,
  error?: Error,
): void => {
  throw new HttpException(
    {
      message,
      detail,
      error,
    },
    code,
  );
};
