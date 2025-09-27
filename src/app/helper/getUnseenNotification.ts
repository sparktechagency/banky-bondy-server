import Notification from '../modules/notification/notification.model';

const getNotificationCount = async (receiver: string = '') => {
  const unseenCount = await Notification.countDocuments({
    seenBy: { $eq: receiver },
    $or: [{ receiver: receiver }, { receiver: 'all' }],
  });
  const latestNotification = await Notification.findOne({
    $or: [{ receiver: receiver }, { receiver: 'all' }],
  })
    .sort({ createdAt: -1 })
    .lean();
  return { unseenCount, latestNotification };
};

export default getNotificationCount;
