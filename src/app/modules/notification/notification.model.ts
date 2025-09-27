import { model, Schema } from 'mongoose';
import { INotification } from './notification.interface';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

const notificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        seenBy: {
            type: [Schema.Types.ObjectId],
            default: [],
        },
        receiver: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(ENUM_NOTIFICATION_TYPE),
            required: true,
        },
        redirectId: {
            type: String,
            default: null,
        },
        deleteBy: {
            type: [Schema.Types.ObjectId],
            default: [],
        },
    },

    {
        timestamps: true,
    }
);

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
