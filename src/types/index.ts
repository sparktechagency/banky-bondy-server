/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// types/express.d.ts or a similar file in your project
declare namespace Express {
    export interface Request {
        files?: {
            product_image?: File[]; // Add more fields as needed, e.g. category_image, profile_image
            // Add other fields you might expect to receive
            profile_image?: File[];
            course_banner?: File[];
            banner?: File[];
            class_banner?: File[];
            icon?: File[];
            sign_image?: File[];
            topic_icon?: File[];
            category_image?: File[];
            video?: File[];
            question_image?: File[];
            topic_image?: File[];
            audio?: File[];
            audio_cover?: File[];
            project_cover?: File[];
            playlist_cover?: File[];
            project_ducument?: File[];
            project_image?: File[];
            institution_cover?: File[];
            comment_image?: File[];
            group_chat_image?: File[];
            profile_cover?: File[];
            conversation_image?: File[];
            conversation_video?: File[];
            conversation_pdf?: File[];
        };
    }
}
