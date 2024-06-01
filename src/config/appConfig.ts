import { registerAs as validateApplicationConfig } from '@nestjs/config';
import { IsNumber } from 'class-validator';
import configNamespace from './configNamespace';
import { customValidate } from './validate.util';

export class ApplicationConfig {
  @IsNumber()
  PORT: number;
}

export default validateApplicationConfig(
  configNamespace.app,
  (): ApplicationConfig => {
    const configs = {
      PORT: parseInt(process.env.PORT, 10) || 3000,
    };
    const validated = customValidate(ApplicationConfig, configs);
    return validated;
  },
);
