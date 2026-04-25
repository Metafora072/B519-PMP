import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  @Transform(({ value }) => value.trim())
  content!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^\d+$/, { each: true })
  mentionUserIds?: string[];
}
