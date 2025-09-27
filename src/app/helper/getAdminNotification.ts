import Notification from '../modules/notification/notification.model';
import { USER_ROLE } from '../modules/user/user.constant';

const getAdminNotificationCount = async () => {
  const unseenCount = await Notification.countDocuments({
    seenBy: { $eq: USER_ROLE.superAdmin },
    $or: [{ receiver: USER_ROLE.superAdmin }, { receiver: 'all' }],
  });
  const latestNotification = await Notification.findOne({
    $or: [{ receiver: USER_ROLE.superAdmin }, { receiver: 'all' }],
  })
    .sort({ createdAt: -1 })
    .lean();
  return { unseenCount, latestNotification };
};

export default getAdminNotificationCount;
