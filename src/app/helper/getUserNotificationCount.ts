import Notification from '../modules/notification/notification.model';

const getUserNotificationCount = async (receiver: string) => {
    const unseenCount = await Notification.countDocuments({
        seen: false,
        receiver: receiver,
    });
    const latestNotification = await Notification.findOne({
        receiver: receiver,
    })
        .sort({ createdAt: -1 })
        .lean();
    return { unseenCount, latestNotification };
};

export default getUserNotificationCount;
