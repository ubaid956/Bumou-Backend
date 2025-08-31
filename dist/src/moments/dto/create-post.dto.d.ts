import { MediaType } from "@prisma/client";
declare class MediaAttachmentDto {
    type: MediaType;
    url: string;
}
export declare class CreatePostDto {
    text?: string;
    mediaAttachments?: MediaAttachmentDto[];
    mood?: string;
    isAnonymous: boolean;
}
export {};
