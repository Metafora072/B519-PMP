import { Transform } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  @Transform(({ value }) => value.trim())
  content!: string;
}
