/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { Server as IOServer, Socket } from 'socket.io';
import { getSingleConversation } from '../helper/getSingleConversation';
import { BondLink } from '../modules/bondLink/bondLink.model';
import ChatGroup from '../modules/chatGroup/chatGroup.model';
import { ENUM_CONVERSATION_TYPE } from '../modules/conversation/conversation.enum';
import Conversation from '../modules/conversation/conversation.model';
import Message from '../modules/message/message.model';
import Project from '../modules/project/project.model';
import { emitError } from './helper';

const handleChat = async (
    io: IOServer,
    socket: Socket,
    currentUserId: string
): Promise<void> => {
    // new message -----------------------------------
    socket.on('send-message', async (data) => {
        if (
            !data.receiver &&
            !data.projectId &&
            !data.groupId &&
            !data.bondLinkId
        ) {
            emitError(socket, {
                code: 400,
                message: 'Receiver or project id required',
                type: 'general',
                details:
                    'You must provide either a receiverId (for one-to-one) or a projectId (for group chat) or a groupId (for chat group) or a bondLinkId (for bond link chat)',
            });
            return;
        }

        if (data?.receiver) {
            let conversation = await Conversation.findOne({
                $and: [
                    { participants: currentUserId },
                    { participants: data.receiver },
                ],
                type: ENUM_CONVERSATION_TYPE.oneToOne,
            });
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [currentUserId, data.receiver],
                });
            }

            const messageData = {
                text: data.text || '',
                imageUrl: data.imageUrl || [],
                videoUrl: data.videoUrl || [],
                pdfUrl: data.pdfUrl || [],
                msgByUserId: currentUserId,
                conversationId: conversation?._id,
            };
            const saveMessage = await Message.create(messageData);
            const populatedMessage = await saveMessage.populate({
                path: 'msgByUserId',
                select: 'name profile_image',
            });
            await Conversation.updateOne(
                { _id: conversation?._id },
                {
                    lastMessage: saveMessage._id,
                }
            );
            // send to the frontend only new message data ---------------
            io.to(currentUserId.toString()).emit(
                `message-${data?.receiver}`,
                populatedMessage
            );
            io.to(data?.receiver.toString()).emit(
                `message-${currentUserId}`,
                populatedMessage
            );

            //send conversation
            const conversationSender = await getSingleConversation(
                conversation._id.toString(),
                currentUserId,
                'participants'
            );
            const conversationReceiver = await getSingleConversation(
                conversation._id.toString(),
                data?.receiver,
                'participants'
            );
            io.to(currentUserId.toString()).emit(
                'conversation',
                conversationSender
            );
            io.to(data?.receiver).emit('conversation', conversationReceiver);
        } else if (data?.projectId) {
            const projectId = data?.projectId;
            if (projectId && Types.ObjectId.isValid(projectId)) {
                console.log('Valid ObjectId');
            } else {
                console.error('Invalid ObjectId');
                emitError(socket, {
                    code: 400,
                    message: 'Invalid ObjectId',
                    type: 'general',
                    details: 'You must provide valid object id',
                });
                return;
            }

            const [project, chat] = await Promise.all([
                Project.findById(data?.projectId)
                    .select('_id')
                    .lean(),
                Conversation.findOne({ project: projectId })
                    .select('_id participants')
                    .lean(),
            ]);

            if (!chat) {
                emitError(socket, {
                    code: 404,
                    message: 'Chat not found',
                    type: 'general',
                    details: 'The group chat was not found',
                });
                return;
            }
            if (!project) {
                emitError(socket, {
                    code: 400,
                    message: 'Project not found',
                    type: 'general',
                    details: 'Project not found',
                });
            }

            // create new message
            const messageData = {
                text: data.text,
                imageUrl: data.imageUrl || [],
                videoUrl: data.videoUrl || [],
                pdfUrl: data.pdfUrl || [],
                msgByUserId: currentUserId,
                conversationId: chat?._id,
            };
            const saveMessage = await Message.create(messageData);
            const populatedMessage = await saveMessage.populate({
                path: 'msgByUserId',
                select: 'name profile_image',
            });
            await Conversation.updateOne(
                { _id: chat?._id },
                {
                    lastMessage: populatedMessage._id,
                }
            );

            // chat.participants.forEach(async (participantId: Types.ObjectId) => {
            //     io.to(participantId.toString()).emit(
            //         `message-${projectId}`,
            //         populatedMessage
            //     );
            //     const singleConversation = await getSingleConversation(
            //         chat._id,
            //         participantId.toString()
            //     );
            //     io.to(participantId.toString()).emit(
            //         'conversation',
            //         singleConversation
            //     );
            // });

            await Promise.all(
                chat.participants.map(async (participantId: Types.ObjectId) => {
                    const uid = participantId.toString();
                    io.to(uid).emit(`message-${projectId}`, populatedMessage);

                    const singleConversation = await getSingleConversation(
                        chat._id.toString(),
                        uid,
                        'project'
                    );
                    io.to(uid).emit('conversation', singleConversation);
                })
            );
        } else if (data?.groupId) {
            const groupId = data?.groupId;
            if (groupId && Types.ObjectId.isValid(groupId)) {
                console.log('Valid ObjectId');
            } else {
                console.error('Invalid ObjectId');
                emitError(socket, {
                    code: 400,
                    message: 'Invalid ObjectId',
                    type: 'general',
                    details: 'You must provide valid object id',
                });
                return;
            }
            const [chatGroup, chat] = await Promise.all([
                ChatGroup.findById(data?.groupId)
                    .select('_id')
                    .lean(),
                Conversation.findOne({ chatGroup: groupId })
                    .select('_id participants')
                    .lean(),
            ]);
            if (!chat) {
                emitError(socket, {
                    code: 404,
                    message: 'Chat not found',
                    type: 'general',
                    details: 'The group chat was not found',
                });
                return;
            }
            if (!chatGroup) {
                emitError(socket, {
                    code: 400,
                    message: 'Chat group not found',
                    type: 'general',
                    details: 'Chat group not found',
                });
            }

            // create new message
            const messageData = {
                text: data.text,
                imageUrl: data.imageUrl || [],
                videoUrl: data.videoUrl || [],
                pdfUrl: data.pdfUrl || [],
                msgByUserId: currentUserId,
                conversationId: chat?._id,
            };
            const saveMessage = await Message.create(messageData);
            const populatedMessage = await saveMessage.populate({
                path: 'msgByUserId',
                select: 'name profile_image',
            });
            await Conversation.updateOne(
                { _id: chat?._id },
                {
                    lastMessage: populatedMessage._id,
                }
            );

            chat.participants.forEach(async (participantId: Types.ObjectId) => {
                io.to(participantId.toString()).emit(
                    `message-${groupId}`,
                    populatedMessage
                );
                const singleConversation = await getSingleConversation(
                    chat._id.toString(),
                    participantId.toString(),
                    'chatGroup'
                );
                io.to(participantId.toString()).emit(
                    'conversation',
                    singleConversation
                );
                // }
            });
        } else if (data?.bondLinkId) {
            const bondLinkId = data?.bondLinkId;
            if (bondLinkId && Types.ObjectId.isValid(bondLinkId)) {
                console.log('Valid ObjectId');
            } else {
                console.error('Invalid ObjectId');
                emitError(socket, {
                    code: 400,
                    message: 'Invalid ObjectId',
                    type: 'general',
                    details: 'You must provide valid object id',
                });
                return;
            }
            const [bondLink, chat] = await Promise.all([
                BondLink.findById(data?.bondLinkId)
                    .select('_id')
                    .lean(),

                Conversation.findOne({ bondLink: bondLinkId })
                    .select('_id participants')
                    .lean(),
            ]);
            if (!chat) {
                emitError(socket, {
                    code: 404,
                    message: 'Chat not found',
                    type: 'general',
                    details: 'The bond link chat was not found',
                });
                return;
            }
            if (!bondLink) {
                emitError(socket, {
                    code: 400,
                    message: 'Bond link chat not found',
                    type: 'general',
                    details: 'Bond link chat not found',
                });
            }

            // create new message
            const messageData = {
                text: data.text,
                imageUrl: data.imageUrl || [],
                videoUrl: data.videoUrl || [],
                pdfUrl: data.pdfUrl || [],
                msgByUserId: currentUserId,
                conversationId: chat?._id,
            };
            const saveMessage = await Message.create(messageData);
            const populatedMessage = await saveMessage.populate({
                path: 'msgByUserId',
                select: 'name profile_image',
            });
            await Conversation.updateOne(
                { _id: chat?._id },
                {
                    lastMessage: populatedMessage._id,
                }
            );

            chat.participants.forEach(async (participantId: Types.ObjectId) => {
                io.to(participantId.toString()).emit(
                    `message-${bondLinkId}`,
                    populatedMessage
                );
                const singleConversation = await getSingleConversation(
                    chat._id.toString(),
                    participantId.toString(),
                    'bondLink'
                );
                io.to(participantId.toString()).emit(
                    'conversation',
                    singleConversation
                );
                // }
            });
        }
    });

    // send---------------------------------
    socket.on('seen', async ({ conversationId, msgByUserId }) => {
        await Message.updateMany(
            { conversationId: conversationId, msgByUserId: msgByUserId },
            { $set: { seen: true } }
        );
        //send conversation --------------
        const conversationSender = await getSingleConversation(
            currentUserId,
            msgByUserId
        );
        const conversationReceiver = await getSingleConversation(
            msgByUserId,
            currentUserId
        );

        io.to(currentUserId as string).emit('conversation', conversationSender);
        io.to(msgByUserId).emit('conversation', conversationReceiver);
    });
};

export default handleChat;
