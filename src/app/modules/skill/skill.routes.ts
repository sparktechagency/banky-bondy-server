import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import SkillController from './skill.controller';
import validateRequest from '../../middlewares/validateRequest';
import SkillValidations from './skill.validation';

const router = express.Router();

// Route to create a new skill
router.post(
    '/create-skill',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    validateRequest(SkillValidations.createSkillValidationSchema),
    SkillController.createSkill
);

// Route to get all skills
router.get(
    '/all-skills',
    // auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    SkillController.getAllSkills
);

// Route to get a skill by ID
router.get(
    '/single-skill/:skillId',
    // auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    SkillController.getSkillById
);

// Route to update a skill by ID
router.patch(
    '/update-skill/:skillId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    validateRequest(SkillValidations.updateSkillValidationSchema),
    SkillController.updateSkill
);

// Route to delete a skill by ID
router.delete(
    '/delete-skill/:skillId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    SkillController.deleteSkill
);

export const skillRoutes = router;
