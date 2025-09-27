import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import bondRatingServices from './bondRating.service';

const addRating = catchAsync(async (req, res) => {
    const result = await bondRatingServices.addRating(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Rating added successfully',
        data: result,
    });
});

const BondRatingController = { addRating };
export default BondRatingController;
