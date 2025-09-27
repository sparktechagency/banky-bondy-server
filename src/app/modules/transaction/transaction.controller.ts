import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import TransactionService from './transaction.service';

const getAllTransaction = catchAsync(async (req, res) => {
  const result = await TransactionService.getAllTransaction(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result,
  });
});

const TransactionController = {
  getAllTransaction,
};

export default TransactionController;
