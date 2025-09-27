import { Types } from 'mongoose';
import { ENUM_FRIEND_REQUEST_STATUS } from './friendRequest.enum';

export interface IFriendRequest {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    status: (typeof ENUM_FRIEND_REQUEST_STATUS)[keyof typeof ENUM_FRIEND_REQUEST_STATUS];
    createdAt?: Date;
    updatedAt?: Date;
}
