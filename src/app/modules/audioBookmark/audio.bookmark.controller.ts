import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import audioBookmarkServices from './audio.bookmark.services';

const audioBookmarkAddDelete = catchAsync(async (req, res) => {
    const result = await audioBookmarkServices.audioBookmarkAddDelete(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: result
            ? 'Bookmark added successfully'
            : 'Bookmark deleted successfully',
        data: result,
    });
});
// get my bookmark
const getMyBookmark = catchAsync(async (req, res) => {
    const result = await audioBookmarkServices.getMyBookmarkFromDB(
        req?.user?.profileId
    );

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Bookmark retrieved successfully',
        data: result,
    });
});

const audioBookmarkController = {
    audioBookmarkAddDelete,
    getMyBookmark,
};

export default audioBookmarkController;
