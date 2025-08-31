import { IsOptional, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class GetUnreadCommentsDto { 
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;
    
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    pageSize?: number = 20;
}

export class MarkCommentsAsReadDto { 
    @IsString({ each: true })
    @IsOptional()
    commentIds?: string[];
    
    @IsString()
    @IsOptional()
    postId?: string;
    
    @IsString({ each: true })
    @IsOptional()
    notificationIds?: string[];
    
    @IsString()
    @IsOptional()
    markAll?: 'true' | 'false';
}
