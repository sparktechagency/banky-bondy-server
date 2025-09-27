/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import Notification from './notification.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
// import getAdminNotificationCount from '../../helper/getAdminNotification';
// import getUnseenNotificationCount from '../../helper/getUnseenNotification';

const getAllNotificationFromDB = async (
    query: Record<string, any>,
    user: JwtPayload
) => {
    if (user?.role === USER_ROLE.superAdmin) {
        const notificationQuery = new QueryBuilder(
            Notification.find({ receiver: USER_ROLE.superAdmin }),
            query
        )
            .search(['name'])
            .filter()
            .sort()
            .paginate()
            .fields();
        const result = await notificationQuery.modelQuery;
        const meta = await notificationQuery.countTotal();
        return { meta, result };
    } else {
        const notificationQuery = new QueryBuilder(
            Notification.find({
                $or: [{ receiver: user.profileId }, { receiver: 'all' }],
                deleteBy: { $ne: user.profileId },
            }).select({ seenBy: 0, deleteBy: 0 }),
            query
        )
            .search(['name'])
            .filter()
            .sort()
            .paginate()
            .fields();
        const result = await notificationQuery.modelQuery;
        const meta = await notificationQuery.countTotal();
        return { meta, result };
    }
};

const seeNotification = async (user: JwtPayload) => {
    console.log('usr', user);
    let result;
    if (user?.role === USER_ROLE.superAdmin) {
        result = await Notification.updateMany(
            { receiver: USER_ROLE.superAdmin },
            { seen: true },
            { runValidators: true, new: true }
        );
        // const adminUnseenNotificationCount = await getAdminNotificationCount();
        //@ts-ignore
        // global.io.emit('admin-notifications', adminUnseenNotificationCount);
    } else {
        result = await Notification.updateMany(
            { $or: [{ receiver: user?.profileId }, { receiver: 'all' }] },
            { $addToSet: { seenBy: user?.profileId } },
            { runValidators: true, new: true }
        );
        console.log('result', result);
    }
    //   const updatedNotificationCount = await getUnseenNotificationCount(
    //     user?.userId,
    //   );
    //@ts-ignore
    //   global.io.to(user?.userId).emit('notifications', updatedNotificationCount);
    return result;
};

// delete notificaiton
const deleteNoficiation = async (id: string, profileId: string) => {
    const notification = await Notification.findOne(
        { $or: [{ receiver: 'all' }, { receiver: profileId }] },
        { _id: id }
    );
    if (!notification) {
        throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    if (notification.receiver == profileId) {
        await Notification.findByIdAndDelete(id);
        return null;
    } else {
        await Notification.findByIdAndUpdate(id, {
            $addToSet: { deleteBy: profileId },
        });
        return null;
    }
};

const notificationService = {
    getAllNotificationFromDB,
    seeNotification,
    deleteNoficiation,
};

export default notificationService;
