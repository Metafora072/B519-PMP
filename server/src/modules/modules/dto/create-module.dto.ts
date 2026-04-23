import { Transform } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsInt,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateModuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => value.trim())
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @Transform(({ value }) => value?.trim())
  ownerId?: string;
}

