import express, { Request, Response, NextFunction } from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ProjectController from './project.controller';
import validateRequest from '../../middlewares/validateRequest';
import ProjectValidations from './project.validation';
import { uploadFile } from '../../helper/mutler-s3-uploader';

const router = express.Router();

// Create Project
router.post(
    '/create',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(ProjectValidations.createProjectValidationSchema),
    ProjectController.createProject
);

// Get All Projects
router.get(
    '/all-projects',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    ProjectController.getAllProjects
);

// Get My Projects
router.get(
    '/my-projects',
    auth(USER_ROLE.user),
    ProjectController.getAllProjects
);

// Get Project by ID
router.get(
    '/single-project/:projectId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    ProjectController.getProjectById
);

// Update Project
router.patch(
    '/update/:projectId',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(ProjectValidations.updateProjectValidationSchema),
    ProjectController.updateProject
);

// Delete Project
router.delete(
    '/delete/:projectId',
    auth(USER_ROLE.user),
    ProjectController.deleteProject
);

export const projectRoutes = router;
