import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';

/* eslint-disable @typescript-eslint/no-explicit-any */
// export const getSingleConversation = async (
//     conversationId: any,
//     currentUserId: string
// ) => {
//     const conversation = await Conversation.findById(conversationId)
//         .sort({ updatedAt: -1 })
//         .populate({
//             path: 'participants',
//             select: 'name profile_image _id ',
//         })
//         .populate({ path: 'lastMessage', model: 'Message' })
//         .populate({ path: 'project', select: 'name cover_image' })
//         .populate({ path: 'chatGroup', select: 'name image' })
//         .populate({ path: 'bondLink', select: 'name' });
//     // .populate({ path: 'projectId', select: 'name title projectImage' });

//     if (!conversation) return null;
//     const countUnseenMessage = await Message.countDocuments({
//         conversationId: conversation._id,
//         msgByUserId: { $ne: currentUserId },
//         seen: false,
//     });

//     const otherUser: any = conversation.participants.find(
//         (participant: any) => participant._id.toString() !== currentUserId
//     );

//     return {
//         _id: conversation._id,
//         userData: {
//             _id: otherUser?._id,
//             name: otherUser?.name,
//             email: otherUser?.email,
//             profileImage: otherUser?.profile_image,
//         },
//         unseenMsg: countUnseenMessage,
//         lastMessage: conversation.lastMessage,
//         type: conversation.type,
//         chatGroup: conversation.chatGroup,
//         project: conversation.project,
//         bondLink: conversation.bondLink,
//     };
// };

type PopulateField = 'participants' | 'project' | 'chatGroup' | 'bondLink';

export const getSingleConversation = async (
    conversationId: string,
    currentUserId: string,
    populateField?: PopulateField // only one field will be passed
) => {
    let query = Conversation.findById(conversationId).sort({ updatedAt: -1 });

    // always populate lastMessage
    query = query.populate({ path: 'lastMessage', model: 'Message' });

    // optional populate based on param
    const populateOptions: Record<PopulateField, any> = {
        participants: {
            path: 'participants',
            select: 'name profile_image _id email',
        },
        project: { path: 'project', select: 'name cover_image' },
        chatGroup: { path: 'chatGroup', select: 'name image' },
        bondLink: { path: 'bondLink', select: 'name' },
    };

    if (populateField) {
        query = query.populate(populateOptions[populateField]);
    }

    const conversation = await query.exec();
    if (!conversation) return null;

    // count unseen messages
    const countUnseenMessage = await Message.countDocuments({
        conversationId: conversation._id,
        msgByUserId: { $ne: currentUserId },
        seen: false,
    });

    // extract the "other" participant if participants were populated
    const otherUser: any = conversation.participants?.find(
        (participant: any) => participant._id.toString() !== currentUserId
    );

    return {
        _id: conversation._id,
        userData:
            populateField === 'participants' && otherUser
                ? {
                      _id: otherUser._id,
                      name: otherUser.name,
                      email: otherUser.email,
                      profileImage: otherUser.profile_image,
                  }
                : null,
        unseenMsg: countUnseenMessage,
        lastMessage: conversation.lastMessage, // always populated
        type: conversation.type,
        chatGroup: conversation.chatGroup,
        project: conversation.project,
        bondLink: conversation.bondLink,
    };
};
