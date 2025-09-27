import express, { Request, Response, NextFunction } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import categoryValidation from './category.validation';
import categoryController from './category.controller';
import { uploadFile } from '../../helper/mutler-s3-uploader';

const router = express.Router();

router.post(
    '/create-category',
    auth(USER_ROLE.superAdmin),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(categoryValidation.createCategoryValidationSchema),
    categoryController.createCategory
);
router.patch(
    '/update-category/:id',
    auth(USER_ROLE.superAdmin),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(categoryValidation.updateCategoryValidationSchema),
    categoryController.updateCategory
);

router.get('/all-categories', categoryController.getAllCategories);
router.get('/get-single-category/:id', categoryController.getSingleCategory);
router.delete(
    '/delete-category/:id',
    auth(USER_ROLE.superAdmin),
    categoryController.deleteCategory
);

export const categoryRoutes = router;
