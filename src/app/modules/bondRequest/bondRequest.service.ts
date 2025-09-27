/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import BondRating from '../bondRating/bondRating.model';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';
import { IBondRequest } from './bondRequest.interface';
import BondRequest from './bondRequest.model';

const createBondRequestIntoDB = async (
    userId: string,
    payload: IBondRequest
) => {
    return await BondRequest.create({ ...payload, user: userId });
};

const getAllBondRequests = async (query: Record<string, unknown>) => {
    const resultQuery = new QueryBuilder(BondRequest.find(), query)
        .search(['give', 'get', 'location'])
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
// get my bond request
const myBondRequests = async (
    userId: string,
    query: Record<string, unknown>
) => {
    const resultQuery = new QueryBuilder(
        BondRequest.find({ user: userId }),
        query
    )
        .search(['give', 'get', 'location'])
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

const getSingleBondRequest = async (id: string) => {
    const bondRequest = await BondRequest.findById(id);
    if (!bondRequest)
        throw new AppError(httpStatus.NOT_FOUND, 'BondRequest not found');
    return bondRequest;
};

const updateBondRequestIntoDB = async (
    userId: string,
    id: string,
    payload: Partial<IBondRequest>
) => {
    const bondRequest = await BondRequest.findOne({ _id: id, user: userId });
    if (!bondRequest)
        throw new AppError(httpStatus.NOT_FOUND, 'BondRequest not found');

    return await BondRequest.findByIdAndUpdate(id, payload, { new: true });
};

const deleteBondRequestFromDB = async (userId: string, id: string) => {
    const bondRequest = await BondRequest.findOne({ user: userId, _id: id });
    if (!bondRequest)
        throw new AppError(httpStatus.NOT_FOUND, 'BondRequest not found');

    return await BondRequest.findByIdAndDelete(id);
};

// const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string
// ): Promise<{ matchRequest: any[] }[]> => {
//     const maxCycleSize = 5;
//     const maxResults = 100;

//     // 1. Fetch initiating bond request
//     const startRequest = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//     })
//         .select('offer want status location radius')
//         .lean();

//     if (!startRequest) {
//         throw new Error('Bond request not found or not eligible for linking.');
//     }

//     // 2. Apply geolocation filter (if radius and location present)
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371], // km to radians
//             },
//         };
//     }

//     // 3. Base filter for other bond requests
//     const baseQuery = {
//         _id: { $ne: bondRequestId },
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         ...geoFilter,
//     };

//     const matches: string[][] = [];

//     // 4. Direct 2-user match
//     const directMatches = await BondRequest.find({
//         ...baseQuery,
//         offer: startRequest.want,
//         want: startRequest.offer,
//     })
//         .select('_id')
//         .lean();

//     for (const match of directMatches) {
//         matches.push([bondRequestId, match._id.toString()]);
//     }

//     // 5. Load all other requests for cycle match
//     const otherRequests = await BondRequest.find(baseQuery)
//         .select('_id user offer want location radius')
//         .lean();

//     // Build maps
//     const requestMap = new Map<string, (typeof otherRequests)[0]>();
//     const offerMap = new Map<string, string[]>();

//     for (const req of otherRequests) {
//         const id = req._id.toString();
//         requestMap.set(id, req);
//         if (!offerMap.has(req.offer)) offerMap.set(req.offer, []);
//         offerMap.get(req.offer)!.push(id);
//     }

//     const getWant = (id: string): string => {
//         if (id === bondRequestId) return startRequest.want;
//         return requestMap.get(id)!.want;
//     };

//     // 6. BFS for 3–5-user cycles
//     const queue: { path: string[]; seen: Set<string> }[] = [
//         { path: [bondRequestId], seen: new Set([bondRequestId]) },
//     ];

//     const seenHashes = new Set<string>();

//     while (queue.length) {
//         const { path, seen } = queue.shift()!;
//         const lastId = path[path.length - 1];
//         const lastWant = getWant(lastId);
//         const nextIds = offerMap.get(lastWant) || [];

//         for (const nextId of nextIds) {
//             if (seen.has(nextId)) {
//                 // cycle found
//                 if (nextId === bondRequestId && path.length >= 3) {
//                     const cycle = [...path];
//                     const hash = cycle.join('-'); // preserve order
//                     if (!seenHashes.has(hash)) {
//                         seenHashes.add(hash);
//                         matches.push(cycle);
//                         if (matches.length >= maxResults) break;
//                     }
//                 }
//                 continue;
//             }

//             if (path.length < maxCycleSize) {
//                 queue.push({
//                     path: [...path, nextId],
//                     seen: new Set(seen).add(nextId),
//                 });
//             }
//         }

//         if (matches.length >= maxResults) break;
//     }

//     // 7. Populate all requests with one DB call---
//     const allIds = [...new Set(matches.flat())];
//     const allPopulated = await BondRequest.find({ _id: { $in: allIds } })
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(
//         allPopulated.map((req) => [req._id.toString(), req])
//     );

//     // 8. Build final result
//     const result: { matchRequest: any[] }[] = [];

//     for (const matchIds of matches.slice(0, maxResults)) {
//         const ordered = matchIds.map((id) => populatedMap.get(id));
//         result.push({ matchRequest: ordered });
//     }

//     return result;
// };

const getMatchingBondRequest = async (
    userId: string,
    bondRequestId: string
): Promise<{ matchRequest: any[] }[]> => {
    const maxCycleSize = 5;
    const maxResults = 100;

    // 1. Fetch initiating bond request
    const startRequest = await BondRequest.findOne({
        _id: bondRequestId,
        user: userId,
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
    })
        .select('offer want status location radius')
        .lean();

    if (!startRequest) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Bond request not found or not eligible for linking.'
        );
    }

    // 2. Apply geolocation filter (if radius and location present)
    const geoFilter: any = {};
    if (startRequest.location && startRequest.radius) {
        const [lng, lat] = startRequest.location.coordinates;
        geoFilter.location = {
            $geoWithin: {
                $centerSphere: [[lng, lat], startRequest.radius / 6371], // km to radians
            },
        };
    }

    // 3. Base filter for other bond requests
    const baseQuery = {
        _id: { $ne: bondRequestId },
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
        ...geoFilter,
    };

    const matches: string[][] = [];

    // 4. Direct 2-user match
    const directMatches = await BondRequest.find({
        ...baseQuery,
        offer: startRequest.want,
        want: startRequest.offer,
    })
        .select('_id')
        .lean();

    for (const match of directMatches) {
        matches.push([bondRequestId, match._id.toString()]);
    }

    // 5. Load all other requests for cycle match
    const otherRequests = await BondRequest.find(baseQuery)
        .select('_id user offer want location radius')
        .lean();

    // Build maps
    const requestMap = new Map<string, (typeof otherRequests)[0]>();
    const offerMap = new Map<string, string[]>();

    for (const req of otherRequests) {
        const id = req._id.toString();
        requestMap.set(id, req);
        if (!offerMap.has(req.offer)) offerMap.set(req.offer, []);
        offerMap.get(req.offer)!.push(id);
    }

    const getWant = (id: string): string => {
        if (id === bondRequestId) return startRequest.want;
        return requestMap.get(id)!.want;
    };

    // 6. BFS for 3–5-user cycles
    const queue: { path: string[]; seen: Set<string> }[] = [
        { path: [bondRequestId], seen: new Set([bondRequestId]) },
    ];

    const seenHashes = new Set<string>();

    while (queue.length) {
        const { path, seen } = queue.shift()!;
        const lastId = path[path.length - 1];
        const lastWant = getWant(lastId);
        const nextIds = offerMap.get(lastWant) || [];

        for (const nextId of nextIds) {
            if (seen.has(nextId)) {
                // cycle found
                if (nextId === bondRequestId && path.length >= 3) {
                    const cycle = [...path];
                    const hash = cycle.join('-'); // preserve order
                    if (!seenHashes.has(hash)) {
                        seenHashes.add(hash);
                        matches.push(cycle);
                        if (matches.length >= maxResults) break;
                    }
                }
                continue;
            }

            if (path.length < maxCycleSize) {
                queue.push({
                    path: [...path, nextId],
                    seen: new Set(seen).add(nextId),
                });
            }
        }

        if (matches.length >= maxResults) break;
    }

    // 7. Populate all requests with one DB call
    const allIds = [...new Set(matches.flat())];
    const allPopulated = await BondRequest.find({ _id: { $in: allIds } })
        .populate({ path: 'user', select: 'name profile_image' })
        .lean();

    const populatedMap = new Map(
        allPopulated.map((req) => [req._id.toString(), req])
    );

    // 7a. Prepare unique (user, offer, want) pairs for rating aggregation
    type RatingKey = string; // `${userId}_${offer}_${want}`
    const ratingKeys = new Set<RatingKey>();
    allPopulated.forEach((req) => {
        ratingKeys.add(`${req.user._id}_${req.offer}_${req.want}`);
    });

    // 7b. Aggregate average ratings for all pairs in one DB call
    // const ratingFilters = Array.from(ratingKeys).map((key) => {
    //     const [rated, offer, want] = key.split('_');
    //     return { rated: new mongoose.Types.ObjectId(rated), offer, want };
    // });

    // const ratings = await BondRating.aggregate([
    //     { $match: { $or: ratingFilters } },
    //     {
    //         $group: {
    //             _id: { rated: '$rated', offer: '$offer', want: '$want' },
    //             avgRating: { $avg: '$rating' },
    //         },
    //     },
    // ]);

    const ratingFilters = Array.from(ratingKeys).map((key) => {
        const [rated, offer, want] = key.split('_');
        return { rated: new mongoose.Types.ObjectId(rated), offer, want };
    });

    // If no rating filters are available, we skip the aggregation to prevent errors
    let ratings = [];
    if (ratingFilters.length > 0) {
        ratings = await BondRating.aggregate([
            { $match: { $or: ratingFilters } },
            {
                $group: {
                    _id: { rated: '$rated', offer: '$offer', want: '$want' },
                    avgRating: { $avg: '$rating' },
                },
            },
        ]);
    }

    // 7c. Map average ratings for quick lookup
    // const ratingMap = new Map<string, number>();
    // ratings.forEach((r) => {
    //     const key = `${r._id.rated}_${r._id.offer}_${r._id.want}`;
    //     ratingMap.set(key, r.avgRating);
    // });
    const ratingMap = new Map<string, number>();
    ratings.forEach((r) => {
        const key = `${r._id.rated}_${r._id.offer}_${r._id.want}`;
        ratingMap.set(key, r.avgRating);
    });

    // 8. Build final result including avgRating
    const result: { matchRequest: any[] }[] = [];

    for (const matchIds of matches.slice(0, maxResults)) {
        const ordered = matchIds.map((id) => {
            const req: any = populatedMap.get(id);
            const ratingKey = `${req.user._id}_${req.offer}_${req.want}`;
            return { ...req, avgRating: ratingMap.get(ratingKey) || 0 };
        });
        result.push({ matchRequest: ordered });
    }

    return result;
};

const bondRequestService = {
    createBondRequestIntoDB,
    getAllBondRequests,
    getSingleBondRequest,
    updateBondRequestIntoDB,
    deleteBondRequestFromDB,
    myBondRequests,
    getMatchingBondRequest,
};

export default bondRequestService;
