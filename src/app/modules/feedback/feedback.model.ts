import { model, Schema } from 'mongoose';
import { IFeedback } from './feedback.interface';

const feedbackSchema = new Schema<IFeedback>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        replyMessage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Feedback = model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;
