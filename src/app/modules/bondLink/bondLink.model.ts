import { model, Schema } from 'mongoose';
import { ENUM_BOND_LINK_STATUS } from './bondLink.enum';
import { IBondLink } from './bondLink.interface';

const BondLinkSchema = new Schema<IBondLink>(
    {
        name: { type: String, required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'NormalUser' }],
        requestedBonds: [{ type: Schema.Types.ObjectId, ref: 'BondRequest' }],
        status: {
            type: String,
            enum: Object.values(ENUM_BOND_LINK_STATUS),
            default: ENUM_BOND_LINK_STATUS.Ongoing,
        },
        markAsCompletedBy: {
            type: [Schema.Types.ObjectId],
            default: [],
        },
    },
    { timestamps: true }
);

export const BondLink = model<IBondLink>('BondLink', BondLinkSchema);
