import { IsNotEmpty, IsString } from "class-validator";

export class AddReplyDto { 
    @IsString()
    @IsNotEmpty()
    reply: string;
    
    @IsString()
    @IsNotEmpty()
    parentCommentId: string;
}
