import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Audio from '../audio/audio.model';
import AudioBookmark from './audio.bookmark.model';

const audioBookmarkAddDelete = async (profileId: string, audioId: string) => {
    const audio = await Audio.findById(audioId);
    if (!audio) {
        throw new AppError(httpStatus.NOT_FOUND, 'Audio not found');
    }
    const bookmark = await AudioBookmark.findOne({
        user: profileId,
        audio: audioId,
    });
    if (bookmark) {
        await AudioBookmark.findOneAndDelete({
            user: profileId,
            audio: audioId,
        });
        return null;
    } else {
        const result = await AudioBookmark.create({
            user: profileId,
            audio: audioId,
        });
        return result;
    }
};

// get bookmark from db
const getMyBookmarkFromDB = async (profileId: string) => {
    const result = await AudioBookmark.find({ user: profileId }).populate({
        path: 'audio',
        populate: { path: 'audioTopic' },
    });
    return result;
};

const audioBookmarkServices = {
    audioBookmarkAddDelete,
    getMyBookmarkFromDB,
};

export default audioBookmarkServices;
