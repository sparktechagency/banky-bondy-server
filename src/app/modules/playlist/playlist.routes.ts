import express, { Request, Response, NextFunction } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import PlaylistController from './playlist.controller';
import validateRequest from '../../middlewares/validateRequest';
import PlaylistValidations from './playlist.validation';
import { uploadFile } from '../../helper/mutler-s3-uploader';

const router = express.Router();

// Create Playlist
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
    validateRequest(PlaylistValidations.createPlaylistValidationSchema),
    PlaylistController.createPlaylist
);

// Get All Playlists
router.get(
    '/all-playlists',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    PlaylistController.getAllPlaylists
);
router.get(
    '/my-playlists',
    auth(USER_ROLE.user),
    PlaylistController.getMyPlaylists
);

// Get Playlist by ID
router.get(
    '/single-playlist/:playlistId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    PlaylistController.getPlaylistById
);

// Update Playlist-----
router.patch(
    '/update/:playlistId',
    auth(USER_ROLE.user),
    uploadFile(),
    (req: Request, res: Response, next: NextFunction) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(PlaylistValidations.updatePlaylistValidationSchema),
    PlaylistController.updatePlaylist
);

// Delete Playlist
router.delete(
    '/delete/:playlistId',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
    PlaylistController.deletePlaylist
);

export const playlistRoutes = router;
