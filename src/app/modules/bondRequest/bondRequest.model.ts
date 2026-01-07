/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';
import { IBondRequest } from './bondRequest.interface';

const BondRequestSchema = new Schema<IBondRequest>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        offer: { type: String, required: true },
        want: { type: String, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point',
            },
            coordinates: { type: [Number], required: true, index: '2dsphere' },
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: Object.values(ENUM_BOND_REQUEST_STATUS),
            default: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        },
        radius: { type: Number },
        isLinked: {
            type: Boolean,
            default: false,
        },
        isPause: {
            type: Boolean,
            default: false,
        },
        offerVector: {
            type: [Number],
            required: true,
            validate: (v: any) => Array.isArray(v) && v.length > 0,
        },
        wantVector: {
            type: [Number],
            required: true,
            validate: (v: any) => Array.isArray(v) && v.length > 0,
        },
    },
    {
        timestamps: true,
    }
);

BondRequestSchema.index({ status: 1 });
BondRequestSchema.index({ offer: 1 });
BondRequestSchema.index({ want: 1 });
BondRequestSchema.index({ user: 1 });

const BondRequest = model<IBondRequest>('BondRequest', BondRequestSchema);
export default BondRequest;
