import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { ENUM_CONVERSATION_TYPE } from '../conversation/conversation.enum';
import Conversation from '../conversation/conversation.model';
import NormalUser from '../normalUser/normalUser.model';
import { IChatGroup } from './chatGroup.interface';
import ChatGroup from './chatGroup.model';

const createGroupChat = async (
    profileId: string,
    payload: Partial<IChatGroup>
) => {
    const result = await ChatGroup.create({ ...payload, creator: profileId });
    if (!payload.participants || payload.participants?.length < 2) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'At least 2 member need to create a group'
        );
    }
    await Conversation.create({
        chatGroup: result._id,
        type: ENUM_CONVERSATION_TYPE.chatGroup,
        participants: [...payload.participants, profileId],
    });
    return result;
};

const updateGroupData = async (
    profileId: string,
    id: string,
    payload: Partial<IChatGroup>
) => {
    const group = await ChatGroup.findById(id);
    if (!group) {
        throw new AppError(httpStatus.NOT_FOUND, 'Group not found');
    }

    if (group.creator.toString() != profileId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You are not authorized for update group'
        );
    }

    const result = await ChatGroup.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const addMember = async (
    profileId: string,
    groupId: string,
    memberId: string
) => {
    const [group, user] = await Promise.all([
        ChatGroup.findById(groupId),
        NormalUser.findById(memberId),
    ]);
    if (!group) {
        throw new AppError(httpStatus.NOT_FOUND, 'Group not found');
    }
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!group.participants.includes(new mongoose.Types.ObjectId(profileId))) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not able to add member , because you are not member of that group'
        );
    }
    if (group.participants.includes(new mongoose.Types.ObjectId(memberId))) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Member is already part of that group'
        );
    }

    group.participants.push(new mongoose.Types.ObjectId(memberId));

    await group.save();

    await Conversation.updateOne(
        { chatGroup: groupId },
        { $push: { participants: memberId } }
    );
    return group;
};

const removeMember = async (
    profileId: string,
    groupId: string,
    memberId: string
) => {
    const group = await ChatGroup.findById(groupId);
    if (!group) {
        throw new AppError(httpStatus.NOT_FOUND, 'Invalid group id');
    }

    if (group.creator.toString() != profileId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You are not authorized for remove member'
        );
    }

    if (!group.participants.includes(new mongoose.Types.ObjectId(memberId))) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'This member not include in that group'
        );
    }

    const result = await ChatGroup.findByIdAndUpdate(
        groupId,
        { $pull: { participants: memberId } },
        { new: true, runValidators: true }
    );
    await Conversation.findOneAndUpdate(
        { chatGroup: groupId },
        { $pull: { participants: memberId } }
    );
    return result;
};

const ChatGroupServices = {
    createGroupChat,
    addMember,
    removeMember,
    updateGroupData,
};
export default ChatGroupServices;
