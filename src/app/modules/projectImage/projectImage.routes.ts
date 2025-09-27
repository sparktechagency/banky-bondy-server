import express, { Request, Response, NextFunction } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import projectImageController from './projectImage.controller';
import { uploadFile } from '../../helper/mutler-s3-uploader';

const router = express.Router();

router.post(
    '/create/:projectId',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    projectImageController.createProjectImage
);

router.get(
    '/get-all/:id',
    auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.admin),
    projectImageController.getAllProjectImages
);

router.patch(
    '/update/:id',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    projectImageController.updateProjectImage
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.user),
    projectImageController.deleteProjectImage
);

export const projectImageRoutes = router;
