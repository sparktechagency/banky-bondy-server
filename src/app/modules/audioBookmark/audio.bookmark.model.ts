import { model, Schema } from 'mongoose';
import { IBookmark } from './audio.bookmark.interface';

const AudioBookmarkSchema = new Schema<IBookmark>(
    {
        audio: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'Audio',
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'NormalUser',
        },
    },
    {
        timestamps: true,
    }
);

const AudioBookmark = model('AudioBookmark', AudioBookmarkSchema);

export default AudioBookmark;
