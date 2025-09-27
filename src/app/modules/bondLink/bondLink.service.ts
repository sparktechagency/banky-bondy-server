/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import BondRequest from '../bondRequest/bondRequest.model';
import { ENUM_CONVERSATION_TYPE } from '../conversation/conversation.enum';
import Conversation from '../conversation/conversation.model';
import { ENUM_BOND_LINK_STATUS } from './bondLink.enum';
import { IBondLink } from './bondLink.interface';
import { BondLink } from './bondLink.model';

const createBondLink = async (payload: IBondLink) => {
    const participants = Array.from(new Set(payload.participants ?? []));
    if (participants.length < 2) {
        throw new Error('At least two participant is required.');
    }

    const requestedBonds = Array.isArray(payload.requestedBonds)
        ? payload.requestedBonds
        : [];

    const session = await mongoose.startSession();
    let createdBondLinkDoc: any;

    try {
        await session.withTransaction(
            async () => {
                // 1) Create BondLink (array form is safest inside transactions)
                const [bondLink] = await BondLink.create(
                    [{ ...payload, participants }],
                    { session }
                );
                createdBondLinkDoc = bondLink;

                // 2) Create Conversation tied to the BondLink
                await Conversation.create(
                    [
                        {
                            participants,
                            type: ENUM_CONVERSATION_TYPE.bondLinkGroup,
                            bondLink: bondLink._id,
                        },
                    ],
                    { session }
                );

                // 3) Bulk delete requested BondRequests
                if (requestedBonds.length) {
                    await BondRequest.updateMany(
                        { _id: { $in: requestedBonds } },
                        {
                            isLinked: true,
                        },
                        { session }
                    );
                }
            },
            // Conservative, durable defaults for the txn
            {
                readConcern: { level: 'local' },
                writeConcern: { w: 'majority' },
                readPreference: 'primary',
            }
        );

        // Return a plain object (nicer for serialization / avoids accidental mutation)
        return createdBondLinkDoc?.toObject
            ? createdBondLinkDoc.toObject()
            : createdBondLinkDoc;
    } catch (err: any) {
        throw err;
    } finally {
        session.endSession();
    }
};

const getMyBondLinks = async (
    userId: string,
    query: Record<string, unknown>
) => {
    const resultQuery = new QueryBuilder(
        BondLink.find({ participants: userId }).populate({
            path: 'requestedBonds',
            populate: { path: 'user', select: 'name profile_image' },
        }),
        query
    )
        .search(['name'])
        .fields()
        .filter()
        .paginate()
        .sort();

    const result = await resultQuery.modelQuery;
    const meta = await resultQuery.countTotal();
    return {
        meta,
        result,
    };
};

const getSingleBondLink = async (profileId: string, id: string) => {
    const bondLink: any = await BondLink.findOne({
        participants: new mongoose.Types.ObjectId(profileId),
        _id: id,
    });

    if (!bondLink) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bond link not found');
    }

    let isMarkAsCompletedByYou = false;
    if (
        bondLink.markAsCompletedBy.includes(
            new mongoose.Types.ObjectId(profileId)
        )
    ) {
        isMarkAsCompletedByYou = true;
    }

    return {
        ...bondLink.toObject(),
        isMarkAsCompletedByYou,
    };
};

const markAsCompleteBond = async (profileId: string, bondLinkId: string) => {
    const bondLink = await BondLink.findById(bondLinkId);
    if (
        !bondLink?.participants.includes(new mongoose.Types.ObjectId(profileId))
    ) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'You are not participant of that bond'
        );
    }

    const result = await BondLink.findOneAndUpdate(
        {
            _id: bondLinkId,
            participants: new mongoose.Types.ObjectId(profileId),
        },
        {
            $addToSet: {
                markAsCompletedBy: new mongoose.Types.ObjectId(profileId),
            },
        },
        { new: true }
    );

    if (!result) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Maybe you are not participant of that bond , if you please contact with admin'
        );
    }
    if (result?.markAsCompletedBy.length === bondLink.participants.length) {
        await BondLink.findByIdAndUpdate(bondLinkId, {
            status: ENUM_BOND_LINK_STATUS.Completed,
        });
    }
    return result;
};

const BondLinkServices = {
    getMyBondLinks,
    createBondLink,
    markAsCompleteBond,
    getSingleBondLink,
};
export default BondLinkServices;
