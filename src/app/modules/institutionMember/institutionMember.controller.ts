import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import institutionMemberServices from './institutionMember.service';

const getAllInstitutionMember = catchAsync(async (req, res) => {
    const result = await institutionMemberServices.getAllInstitutionMember(
        req.params.id,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institution member retrieved successfully',
        data: result,
    });
});
const removeMember = catchAsync(async (req, res) => {
    const result = await institutionMemberServices.removeMember(
        req.user.profileId,
        req.params.id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Institution member removed successfully',
        data: result,
    });
});

const InstitutionMemberController = { getAllInstitutionMember, removeMember };
export default InstitutionMemberController;
