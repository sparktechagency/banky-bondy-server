import { Schema, model, Types } from 'mongoose';
import { IPlaylist } from './playlist.interface';

const playlistSchema = new Schema<IPlaylist>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        tags: { type: [String], default: [] },
        cover_image: { type: String, required: true },
        audios: [{ type: Types.ObjectId, ref: 'Audio', required: true }],
    },
    { timestamps: true }
);

const Playlist = model<IPlaylist>('Playlist', playlistSchema);

export default Playlist;
