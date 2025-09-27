/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/appError';
import { BondLink } from '../bondLink/bondLink.model';
import { IBondRating } from './bondRating.interface';
import BondRating from './bondRating.model';

const addRating = async (
    profileId: string,
    payload: IBondRating & { userId: string }
) => {
    console.log('playload', payload);
    const bondLink = await BondLink.findOne({
        _id: payload.bondLink,
        participants: new mongoose.Types.ObjectId(profileId),
    }).populate({ path: 'requestedBonds' });

    console.log('bondlink', bondLink);
    const ratedUserBondRequest: any = bondLink?.requestedBonds.find(
        (bond: any) => bond.user.toString() == payload.userId
    );

    console.log('reated uer ond ', ratedUserBondRequest);
    if (!ratedUserBondRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Rated user bond request not found'
        );
    }
    if (!bondLink) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bond link not found');
    }

    const existingRating = await BondRating.findOne({
        rated: payload.userId,
        ratedBy: profileId,
        bondLink: payload.bondLink,
    });

    if (existingRating) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'You already gave rating to that user for this bond'
        );
    }
    const result = await BondRating.create({
        rated: payload.userId,
        ratedBy: profileId,
        bondLink: payload.bondLink,
        want: ratedUserBondRequest.want,
        offer: ratedUserBondRequest.offer,
        rating: payload.rating,
    });

    console.log('result', result);

    return result;
};

const BondRatingServices = { addRating };
export default BondRatingServices;
