import { IsNotEmpty, IsString } from 'class-validator';

export class MarkCommentReadDto {
  @IsNotEmpty()
  @IsString()
  commentId: string;
}
