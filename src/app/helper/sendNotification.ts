import { INotification } from '../modules/notification/notification.interface';
import Notification from '../modules/notification/notification.model';
import { getIO } from '../socket/socket';
import getUserNotificationCount from './getUserNotificationCount';

const sendNotification = async (notificationData: INotification) => {
    const io = getIO();
    await Notification.create(notificationData);

    const updatedNotification = await getUserNotificationCount(
        notificationData.receiver.toString()
    );

    io.to(notificationData.receiver.toString()).emit(
        'notification',
        updatedNotification
    );
};

export default sendNotification;
