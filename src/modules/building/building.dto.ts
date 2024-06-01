import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsAlphanumeric()
  @ApiProperty()
  code: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional()
  parentId: number | null;

  @ValidateIf((o) => o.parentId === null)
  @IsNotEmpty()
  @ApiPropertyOptional()
  building?: string;
}

export class UpdateBuildingDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsAlphanumeric()
  @ApiProperty()
  code: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty()
  parentId: number | null;

  @ValidateIf((o) => o.parentId === null)
  @IsNotEmpty()
  @ApiProperty()
  building: string;
}
