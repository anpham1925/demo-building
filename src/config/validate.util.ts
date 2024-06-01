import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function customValidate<T>(
  cls: ClassConstructor<T>,
  config: Record<string, unknown>,
) {
  const validatedConfig = plainToInstance(cls, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig as object, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export function parseTrueValue(value) {
  return value === 'true' || value === true || +value === 1;
}
