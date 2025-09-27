import ConversationComment from './conversationComment.model';
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IConversationComment } from './conversationComment.interface';

// Create
const create = async (payload: IConversationComment) => {
    return await ConversationComment.create(payload);
};

// Get All
const getAll = async () => {
    return await ConversationComment.find()
        .populate('institutionConversation')
        .populate('likers');
};

// Update
const update = async (id: string, payload: Partial<IConversationComment>) => {
    const result = await ConversationComment.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    return result;
};

// Delete
const remove = async (id: string) => {
    const result = await ConversationComment.findByIdAndDelete(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    return result;
};

const ConversationCommentService = {
    create,
    getAll,
    update,
    remove,
};

export default ConversationCommentService;
