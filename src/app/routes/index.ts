import { Router } from 'express';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { audioRoutes } from '../modules/audio/audio.routes';
import { audioBookmarkRoutes } from '../modules/audioBookmark/audio.bookmark.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { bannerRoutes } from '../modules/banner/banner.routes';
import { bondRoutes } from '../modules/bond/bond.routes';
import { bondLinkRoutes } from '../modules/bondLink/bondLink.routes';
import { bondRatingRoutes } from '../modules/bondRating/bondRating.routes';
import { bondRequestRoutes } from '../modules/bondRequest/bondRequest.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { chatGroupRoutes } from '../modules/chatGroup/chatGroup.routes';
import { commentRoutes } from '../modules/comment/comment.routes';
import { conversationRoutes } from '../modules/conversation/conversation.routes';
import { DonateRoutes } from '../modules/donate/donate.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';
import { fileUploadRoutes } from '../modules/file/file.routes';
import { friendRequestRoutes } from '../modules/friendRequest/friendRequest.routes';
import { institutionRoutes } from '../modules/institution/institution.routes';
import { institutionConversationRoutes } from '../modules/institutionConversation/institutionConversation.routes';
import { institutionMemberRoutes } from '../modules/institutionMember/institutionMember.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { messageRoutes } from '../modules/message/message.routes';
import { metaRoutes } from '../modules/meta/meta.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { playlistRoutes } from '../modules/playlist/playlist.routes';
import { projectRoutes } from '../modules/project/project.routes';
import { projectDocumentRoutes } from '../modules/projectDocument/projectDocument.routes';
import { projectImageRoutes } from '../modules/projectImage/projectImage.routes';
import { projectJoinRequestRoutes } from '../modules/projectJoinRequest/projectJoinRequest.routes';
import { projectMemberRoutes } from '../modules/projectMember/projectMember.routes';
import { recommendedUserRoutes } from '../modules/recommendedUser/recommendedUser.routes';
import { relativeRoutes } from '../modules/relative/relative.routes';
import { reportRoutes } from '../modules/report/report.routes';
import { skillRoutes } from '../modules/skill/skill.routes';
import { superAdminRoutes } from '../modules/superAdmin/superAdmin.routes';
import { topicRoutes } from '../modules/topic/topic.routes';
import { transactionRoutes } from '../modules/transaction/transaction.routes';
import { userRoutes } from '../modules/user/user.routes';

const router = Router();

const moduleRoutes = [
    {
        path: '/auth',
        router: authRoutes,
    },
    {
        path: '/user',
        router: userRoutes,
    },
    {
        path: '/normal-user',
        router: normalUserRoutes,
    },
    {
        path: '/admin',
        router: AdminRoutes,
    },
    {
        path: '/manage',
        router: ManageRoutes,
    },
    {
        path: '/notification',
        router: notificationRoutes,
    },
    {
        path: '/category',
        router: categoryRoutes,
    },

    {
        path: '/banner',
        router: bannerRoutes,
    },
    {
        path: '/meta',
        router: metaRoutes,
    },
    {
        path: '/feedback',
        router: feedbackRoutes,
    },

    {
        path: '/transaction',
        router: transactionRoutes,
    },

    {
        path: '/topic',
        router: topicRoutes,
    },
    {
        path: '/report',
        router: reportRoutes,
    },
    {
        path: '/skill',
        router: skillRoutes,
    },
    {
        path: '/relative',
        router: relativeRoutes,
    },
    {
        path: '/project',
        router: projectRoutes,
    },
    {
        path: '/audio',
        router: audioRoutes,
    },
    {
        path: '/audio-bookmark',
        router: audioBookmarkRoutes,
    },
    {
        path: '/playlist',
        router: playlistRoutes,
    },
    {
        path: '/project-join-request',
        router: projectJoinRequestRoutes,
    },
    {
        path: '/project-member',
        router: projectMemberRoutes,
    },
    {
        path: '/project-document',
        router: projectDocumentRoutes,
    },
    {
        path: '/project-image',
        router: projectImageRoutes,
    },
    {
        path: '/institution',
        router: institutionRoutes,
    },
    {
        path: '/institution-member',
        router: institutionMemberRoutes,
    },
    {
        path: '/institution-conversation',
        router: institutionConversationRoutes,
    },
    {
        path: '/comment',
        router: commentRoutes,
    },
    {
        path: '/bond',
        router: bondRoutes,
    },
    {
        path: '/bond-request',
        router: bondRequestRoutes,
    },
    {
        path: '/friend-request',
        router: friendRequestRoutes,
    },
    {
        path: '/bond-link',
        router: bondLinkRoutes,
    },
    {
        path: '/donate',
        router: DonateRoutes,
    },
    {
        path: '/chat-group',
        router: chatGroupRoutes,
    },
    {
        path: '/conversation',
        router: conversationRoutes,
    },
    {
        path: '/message',
        router: messageRoutes,
    },
    {
        path: '/file-upload',
        router: fileUploadRoutes,
    },
    {
        path: '/super-admin',
        router: superAdminRoutes,
    },
    {
        path: '/bond-rating',
        router: bondRatingRoutes,
    },
    {
        path: '/recommended-user',
        router: recommendedUserRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
