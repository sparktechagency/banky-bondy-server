/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { isTextSafe } from '../../helper/isTextSafe';
import { generateEmbedding } from '../../utilities/embedding';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';
import { IBondRequest } from './bondRequest.interface';
import BondRequest from './bondRequest.model';

const createBondRequestIntoDB = async (
    userId: string,
    payload: IBondRequest
) => {
    const offerCheck = await isTextSafe(payload.offer);

    if (!offerCheck.safe)
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Offer is not allowed: ${offerCheck.reason}`
        );
    const wantCheck = await isTextSafe(payload.want);

    if (!wantCheck.safe)
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Want is not allowed: ${wantCheck.reason}`
        );
    const [offerVector, wantVector] = await Promise.all([
        generateEmbedding(payload.offer),
        generateEmbedding(payload.want),
    ]);

    return await BondRequest.create({
        ...payload,
        offerVector,
        wantVector,
        user: userId,
    });
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
        BondRequest.find({ user: userId }).select('-offerVector -wantVector'),
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

    if (payload.offer) {
        const offerCheck = await isTextSafe(payload.offer);

        if (!offerCheck.safe)
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Offer is not allowed: ${offerCheck.reason}`
            );
    }
    if (payload.want) {
        const wantCheck = await isTextSafe(payload.want);

        if (!wantCheck.safe)
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Want is not allowed: ${wantCheck.reason}`
            );
    }

    if (payload.offer && payload.want) {
        const [offerVector, wantVector] = await Promise.all([
            generateEmbedding(payload.offer),
            generateEmbedding(payload.want),
        ]);

        return await BondRequest.findByIdAndUpdate(
            id,
            { ...payload, offerVector, wantVector },
            { new: true }
        );
    } else if (payload.offer) {
        const offerVector = await generateEmbedding(payload.offer);
        return await BondRequest.findByIdAndUpdate(
            id,
            { ...payload, offerVector },
            { new: true }
        );
    } else if (payload.want) {
        const wantVector = await generateEmbedding(payload.want);
        return await BondRequest.findByIdAndUpdate(
            id,
            { ...payload, wantVector },
            { new: true }
        );
    } else {
        return await BondRequest.findByIdAndUpdate(id, payload, { new: true });
    }
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
//         isPause: false,
//     })
//         .select('offer want status location radius')
//         .lean();

//     if (!startRequest) {
//         throw new AppError(
//             httpStatus.NOT_FOUND,
//             'Bond request not found or not eligible for linking.'
//         );
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
//         isPause: false,
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

//     // 7. Populate all requests with one DB call
//     const allIds = [...new Set(matches.flat())];
//     const allPopulated = await BondRequest.find({ _id: { $in: allIds } })
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(
//         allPopulated.map((req) => [req._id.toString(), req])
//     );

//     // 7a. Prepare unique (user, offer, want) pairs for rating aggregation
//     type RatingKey = string; // `${userId}_${offer}_${want}`
//     const ratingKeys = new Set<RatingKey>();
//     allPopulated.forEach((req) => {
//         ratingKeys.add(`${req.user._id}_${req.offer}_${req.want}`);
//     });

//     // 7b. Aggregate average ratings for all pairs in one DB call
//     // const ratingFilters = Array.from(ratingKeys).map((key) => {
//     //     const [rated, offer, want] = key.split('_');
//     //     return { rated: new mongoose.Types.ObjectId(rated), offer, want };
//     // });

//     // const ratings = await BondRating.aggregate([
//     //     { $match: { $or: ratingFilters } },
//     //     {
//     //         $group: {
//     //             _id: { rated: '$rated', offer: '$offer', want: '$want' },
//     //             avgRating: { $avg: '$rating' },
//     //         },
//     //     },
//     // ]);

//     const ratingFilters = Array.from(ratingKeys).map((key) => {
//         const [rated, offer, want] = key.split('_');
//         return { rated: new mongoose.Types.ObjectId(rated), offer, want };
//     });

//     // If no rating filters are available, we skip the aggregation to prevent errors
//     let ratings = [];
//     if (ratingFilters.length > 0) {
//         ratings = await BondRating.aggregate([
//             { $match: { $or: ratingFilters } },
//             {
//                 $group: {
//                     _id: { rated: '$rated', offer: '$offer', want: '$want' },
//                     avgRating: { $avg: '$rating' },
//                 },
//             },
//         ]);
//     }

//     // 7c. Map average ratings for quick lookup
//     // const ratingMap = new Map<string, number>();
//     // ratings.forEach((r) => {
//     //     const key = `${r._id.rated}_${r._id.offer}_${r._id.want}`;
//     //     ratingMap.set(key, r.avgRating);
//     // });
//     const ratingMap = new Map<string, number>();
//     ratings.forEach((r) => {
//         const key = `${r._id.rated}_${r._id.offer}_${r._id.want}`;
//         ratingMap.set(key, r.avgRating);
//     });

//     // 8. Build final result including avgRating
//     const result: { matchRequest: any[] }[] = [];

//     for (const matchIds of matches.slice(0, maxResults)) {
//         const ordered = matchIds.map((id) => {
//             const req: any = populatedMap.get(id);
//             const ratingKey = `${req.user._id}_${req.offer}_${req.want}`;
//             return { ...req, avgRating: ratingMap.get(ratingKey) || 0 };
//         });
//         result.push({ matchRequest: ordered });
//     }

//     return result;
// };

// cosine similarity for embeddings
// export const cosineSimilarity = (a: number[], b: number[]): number => {
//     if (!Array.isArray(a) || !Array.isArray(b)) return 0;
//     const minLen = Math.min(a.length, b.length);
//     let dot = 0,
//         magA = 0,
//         magB = 0;
//     for (let i = 0; i < minLen; i++) {
//         dot += a[i] * b[i];
//         magA += a[i] * a[i];
//         magB += b[i] * b[i];
//     }
//     magA = Math.sqrt(magA);
//     magB = Math.sqrt(magB);
//     if (!magA || !magB) return 0;
//     return dot / (magA * magB);
// };

// // normalize text and compute token overlap
// export const normalizeText = (s?: string) =>
//     (s || '')
//         .toLowerCase()
//         .replace(/[^\w\s]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();

// export const tokenOverlapRatio = (a?: string, b?: string): number => {
//     const A = normalizeText(a).split(' ').filter(Boolean);
//     const B = normalizeText(b).split(' ').filter(Boolean);
//     if (!A.length || !B.length) return 0;
//     const setB = new Set(B);
//     const overlap = A.filter((t) => setB.has(t)).length;
//     return overlap / Math.min(A.length, B.length);
// };

// // semantic + token-overlap match check
// export const isSemanticMatch = (
//     wantVec?: number[],
//     offerVec?: number[],
//     wantText?: string,
//     offerText?: string,
//     threshold = 0.72
// ) => {
//     const sim = cosineSimilarity(wantVec || [], offerVec || []);
//     const overlap = tokenOverlapRatio(wantText, offerText);
//     return sim >= threshold || overlap >= 0.6;
// };

// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string
// ) => {
//     const maxCycleSize = 5;
//     const maxResults = 100;

//     // 1. Fetch initiating bond request
//     const startRequest = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//     })
//         .select('offer want offerVector wantVector location radius')
//         .lean();

//     if (!startRequest) throw new AppError(404, 'Bond request not found');

//     // 2. Generate missing embeddings
//     if (!startRequest.offerVector?.length) {
//         startRequest.offerVector = await generateEmbedding(startRequest.offer);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { offerVector: startRequest.offerVector }
//         );
//     }
//     if (!startRequest.wantVector?.length) {
//         startRequest.wantVector = await generateEmbedding(startRequest.want);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { wantVector: startRequest.wantVector }
//         );
//     }

//     // 3. Geo filter
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 4. Fetch candidate bond requests
//     const candidates = await BondRequest.find({
//         _id: { $ne: bondRequestId },
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//         ...geoFilter,
//     })
//         .select('_id user offer want offerVector wantVector location radius')
//         .lean();

//     const matches: string[][] = [];

//     // 5. Direct semantic matches
//     for (const candidate of candidates) {
//         // backfill embeddings if missing
//         if (!candidate.offerVector?.length)
//             candidate.offerVector = await generateEmbedding(candidate.offer);
//         if (!candidate.wantVector?.length)
//             candidate.wantVector = await generateEmbedding(candidate.want);

//         if (
//             isSemanticMatch(
//                 startRequest.wantVector,
//                 candidate.offerVector,
//                 startRequest.want,
//                 candidate.offer
//             ) &&
//             isSemanticMatch(
//                 candidate.wantVector,
//                 startRequest.offerVector,
//                 candidate.want,
//                 startRequest.offer
//             )
//         ) {
//             matches.push([bondRequestId, candidate._id.toString()]);
//         }
//     }

//     // 6. Multi-person cycle matches (BFS, 3–5)
//     const requestMap = new Map(candidates.map((c) => [c._id.toString(), c]));
//     const queue = [{ path: [bondRequestId], seen: new Set([bondRequestId]) }];
//     const seenHashes = new Set<string>();

//     while (queue.length) {
//         const { path, seen } = queue.shift()!;
//         const lastId = path[path.length - 1];
//         const lastReq =
//             lastId === bondRequestId ? startRequest : requestMap.get(lastId);
//         if (!lastReq) continue;

//         for (const [nextId, nextReq] of requestMap.entries()) {
//             if (seen.has(nextId)) continue;

//             if (
//                 isSemanticMatch(
//                     lastReq.wantVector,
//                     nextReq.offerVector,
//                     lastReq.want,
//                     nextReq.offer
//                 )
//             ) {
//                 const newPath = [...path, nextId];
//                 const newSeen = new Set(seen).add(nextId);

//                 if (
//                     isSemanticMatch(
//                         nextReq.wantVector,
//                         startRequest.offerVector,
//                         nextReq.want,
//                         startRequest.offer
//                     ) &&
//                     newPath.length >= 3
//                 ) {
//                     const hash = newPath.join('-');
//                     if (!seenHashes.has(hash)) {
//                         seenHashes.add(hash);
//                         matches.push(newPath);
//                         if (matches.length >= maxResults) break;
//                     }
//                 }

//                 if (newPath.length < maxCycleSize)
//                     queue.push({ path: newPath, seen: newSeen });
//             }
//         }
//         if (matches.length >= maxResults) break;
//     }

//     // 7. Populate matches with user info
//     const allIds = [...new Set(matches.flat())];
//     const allPopulated = await BondRequest.find({ _id: { $in: allIds } })
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(
//         allPopulated.map((r) => [r._id.toString(), r])
//     );

//     // 8. Add average ratings
//     const ratingKeys = new Set(
//         allPopulated.map((req) => `${req.user._id}_${req.offer}_${req.want}`)
//     );
//     const ratingFilters = Array.from(ratingKeys).map((key) => {
//         const [rated, offer, want] = key.split('_');
//         return { rated: new mongoose.Types.ObjectId(rated), offer, want };
//     });

//     const ratings =
//         ratingFilters.length > 0
//             ? await BondRating.aggregate([
//                   { $match: { $or: ratingFilters } },
//                   {
//                       $group: {
//                           _id: {
//                               rated: '$rated',
//                               offer: '$offer',
//                               want: '$want',
//                           },
//                           avgRating: { $avg: '$rating' },
//                       },
//                   },
//               ])
//             : [];

//     const ratingMap = new Map<string, number>();
//     ratings.forEach((r) =>
//         ratingMap.set(
//             `${r._id.rated}_${r._id.offer}_${r._id.want}`,
//             r.avgRating
//         )
//     );

//     // 9. Build final result
//     const result = matches.slice(0, maxResults).map((matchIds) => {
//         const ordered = matchIds.map((id) => {
//             const req: any = populatedMap.get(id);
//             const ratingKey = `${req.user._id}_${req.offer}_${req.want}`;
//             return { ...req, avgRating: ratingMap.get(ratingKey) || 0 };
//         });
//         return { matchRequest: ordered };
//     });

//     return result;
// };

// another try ------------------------------

// // ----------------- Helpers -----------------
// export const cosineSimilarity = (a: number[], b: number[]): number => {
//     if (!Array.isArray(a) || !Array.isArray(b)) return 0;
//     const minLen = Math.min(a.length, b.length);
//     let dot = 0,
//         magA = 0,
//         magB = 0;
//     for (let i = 0; i < minLen; i++) {
//         dot += a[i] * b[i];
//         magA += a[i] * a[i];
//         magB += b[i] * b[i];
//     }
//     magA = Math.sqrt(magA);
//     magB = Math.sqrt(magB);
//     if (!magA || !magB) return 0;
//     return dot / (magA * magB);
// };

// export const normalizeText = (s?: string) =>
//     (s || '')
//         .toLowerCase()
//         .replace(/[^\w\s]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();

// export const tokenOverlapRatio = (a?: string, b?: string): number => {
//     const A = normalizeText(a).split(' ').filter(Boolean);
//     const B = normalizeText(b).split(' ').filter(Boolean);
//     if (!A.length || !B.length) return 0;
//     const setB = new Set(B);
//     const overlap = A.filter((t) => setB.has(t)).length;
//     return overlap / Math.min(A.length, B.length);
// };

// export const calculateMatchScore = (
//     wantVec: number[] = [],
//     offerVec: number[] = [],
//     wantText: string = '',
//     offerText: string = ''
// ): number => {
//     const sim = cosineSimilarity(wantVec || [], offerVec || []);
//     const overlap = tokenOverlapRatio(wantText, offerText);
//     // Weighted combination (you can tweak weights)
//     return 0.7 * sim + 0.3 * overlap;
// };

// export const isHighConfidenceMatch = (score: number) => score >= 0.7;

// // ----------------- Main Function -----------------
// /**
//  * getMatchingBondRequest
//  * - userId, bondRequestId: required
//  * - page, limit: pagination
//  * - minScore: minimum individual-direction match threshold (default 0.4)
//  */
// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const minScore = 0.4; // default  restores earlier "partial match down to 0.4" behavior
//     const maxCycleSize = 5;
//     const MIN_SCORE = Number(minScore); // per-direction minimum
//     const isEmpty = (s?: string) => normalizeText(s) === 'empty';
//     const isSurprise = (s?: string) => normalizeText(s) === 'surprise';

//     // 1. Fetch starting bond request
//     const startRequest = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//     })
//         .select('offer want offerVector wantVector location radius')
//         .lean();

//     if (!startRequest) throw new AppError(404, 'Bond request not found');

//     // 2. Ensure embeddings exist for startRequest
//     if (!startRequest.offerVector || !startRequest.offerVector.length) {
//         startRequest.offerVector = await generateEmbedding(startRequest.offer);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { offerVector: startRequest.offerVector }
//         );
//     }
//     if (!startRequest.wantVector || !startRequest.wantVector.length) {
//         startRequest.wantVector = await generateEmbedding(startRequest.want);
//         await BondRequest.updateOne(
//             { _id: startRequest._id },
//             { wantVector: startRequest.wantVector }
//         );
//     }

//     // 3. Geo filter (optional)
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         // radius is expected in kilometers; convert to radians by dividing by Earth radius (km)
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 4. Fetch all candidates (excluding the same bond and same user)
//     const candidates = await BondRequest.find({
//         _id: { $ne: bondRequestId },
//         user: { $ne: userId }, // avoid matching with own requests
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//         ...geoFilter,
//     })
//         .select('_id user offer want offerVector wantVector location radius')
//         .lean();

//     // quick debug helpers (you can remove these logs in production)
//     // console.debug(`[getMatchingBondRequest] candidates found: ${candidates.length}, minScore: ${MIN_SCORE}`);

//     const matches: { ids: string[]; score: number }[] = [];
//     const globalSeen = new Set<string>(); // prevent duplicates (pairs/cycles)

//     // 5. Ensure embeddings for all candidates (generate if missing)
//     for (const candidate of candidates) {
//         if (!candidate.offerVector || !candidate.offerVector.length) {
//             candidate.offerVector = await generateEmbedding(
//                 candidate.offer || ''
//             );
//             // optional: persist to DB in background if you want
//             // await BondRequest.updateOne({ _id: candidate._id }, { offerVector: candidate.offerVector });
//         }
//         if (!candidate.wantVector || !candidate.wantVector.length) {
//             candidate.wantVector = await generateEmbedding(
//                 candidate.want || ''
//             );
//             // await BondRequest.updateOne({ _id: candidate._id }, { wantVector: candidate.wantVector });
//         }
//     }

//     // 6. Pairwise 2-person matches (require both directions meet MIN_SCORE)
//     for (const candidate of candidates) {
//         // "Empty" logic: if start says Empty on offer, only match candidate who ALSO wants Empty
//         const startOfferEmpty = isEmpty(startRequest.offer);
//         const startWantEmpty = isEmpty(startRequest.want);
//         const candidateOfferEmpty = isEmpty(candidate.offer);
//         const candidateWantEmpty = isEmpty(candidate.want);

//         if (
//             (startOfferEmpty && !candidateWantEmpty) ||
//             (startWantEmpty && !candidateOfferEmpty)
//         ) {
//             continue;
//         }

//         // "Surprise" logic: treat surprise as wildcard; but skip if both sides are literally "surprise"
//         if (
//             (isSurprise(startRequest.offer) && isSurprise(candidate.want)) ||
//             (isSurprise(startRequest.want) && isSurprise(candidate.offer))
//         ) {
//             continue;
//         }

//         // calculate both directions
//         const score1 = calculateMatchScore(
//             startRequest.wantVector || [],
//             candidate.offerVector || [],
//             startRequest.want || '',
//             candidate.offer || ''
//         );
//         const score2 = calculateMatchScore(
//             candidate.wantVector || [],
//             startRequest.offerVector || [],
//             candidate.want || '',
//             startRequest.offer || ''
//         );

//         // require both directions to reach MIN_SCORE
//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             let avgScore = (score1 + score2) / 2;

//             // small bonus if either side is "surprise" (wildcard)
//             if (
//                 isSurprise(startRequest.offer) ||
//                 isSurprise(candidate.want) ||
//                 isSurprise(startRequest.want) ||
//                 isSurprise(candidate.offer)
//             ) {
//                 avgScore = Math.min(1, avgScore + 0.05);
//             }

//             // dedupe pair using sorted key
//             const pairKey = [bondRequestId, candidate._id.toString()]
//                 .slice()
//                 .sort()
//                 .join('-');
//             if (!globalSeen.has(pairKey)) {
//                 globalSeen.add(pairKey);
//                 matches.push({
//                     ids: [bondRequestId, candidate._id.toString()],
//                     score: avgScore,
//                 });
//             }
//         }
//     }

//     // 7. Build requestMap and edges for cycles (3-5)
//     const requestMap = new Map<string, any>(
//         candidates.map((c) => [c._id.toString(), c])
//     );
//     requestMap.set(bondRequestId, startRequest);

//     const edges: Map<string, { to: string; score: number }[]> = new Map();
//     for (const [id, req] of requestMap.entries()) {
//         // ensure vectors exist (safety)
//         if (!req.offerVector || !req.offerVector.length) {
//             req.offerVector = await generateEmbedding(req.offer || '');
//         }
//         if (!req.wantVector || !req.wantVector.length) {
//             req.wantVector = await generateEmbedding(req.want || '');
//         }

//         edges.set(id, []);
//         for (const [toId, toReq] of requestMap.entries()) {
//             if (id === toId) continue;

//             // don't create edge when "empty" mismatch (same logic as pair matching)
//             if (isEmpty(req.offer) && !isEmpty(toReq.want)) continue;
//             if (isEmpty(req.want) && !isEmpty(toReq.offer)) continue;
//             if (isSurprise(req.offer) && isSurprise(toReq.want)) continue;
//             if (isSurprise(req.want) && isSurprise(toReq.offer)) continue;

//             const score = calculateMatchScore(
//                 req.wantVector || [],
//                 toReq.offerVector || [],
//                 req.want || '',
//                 toReq.offer || ''
//             );
//             if (score >= MIN_SCORE) {
//                 edges.get(id)!.push({ to: toId, score });
//             }
//         }
//     }

//     // 8. DFS to find cycles (3..maxCycleSize)
//     const seenCycles = new Set<string>();
//     const dfs = (
//         startId: string,
//         currentId: string,
//         path: string[],
//         accScore: number
//     ) => {
//         if (path.length > maxCycleSize) return;
//         for (const { to, score: nextScore } of edges.get(currentId) || []) {
//             if (path.includes(to)) {
//                 // closed cycle
//                 if (to === startId && path.length >= 3) {
//                     const hash = path.join('-'); // preserve order for cycles
//                     if (!seenCycles.has(hash)) {
//                         seenCycles.add(hash);
//                         // dedupe cycles as well (use ordered key so same cycle in different traversal won't duplicate)
//                         const cycleKey = hash;
//                         if (!globalSeen.has(cycleKey)) {
//                             globalSeen.add(cycleKey);
//                             matches.push({ ids: [...path], score: accScore });
//                         }
//                     }
//                 }
//                 continue;
//             }
//             const newScore = (accScore + nextScore) / 2; // average along path
//             dfs(startId, to, [...path, to], newScore);
//         }
//     };

//     dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

//     // 9. Populate match requests
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     // 10. Sort, paginate, prepare final result
//     const sorted = matches.sort((a, b) => b.score - a.score);
//     const total = sorted.length;
//     const startIndex = (page - 1) * limit;
//     const paginated = sorted.slice(startIndex, startIndex + limit);

//     const result = paginated.map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//     }));

//     return {
//         total,
//         page,
//         limit,
//         data: result,
//     };
// };

// // ----------------- Helpers -----------------
// const cosineSimilarity = (a: number[], b: number[]): number => {
//     if (!Array.isArray(a) || !Array.isArray(b)) return 0;
//     const len = Math.min(a.length, b.length);
//     let dot = 0,
//         magA = 0,
//         magB = 0;
//     for (let i = 0; i < len; i++) {
//         dot += a[i] * b[i];
//         magA += a[i] ** 2;
//         magB += b[i] ** 2;
//     }
//     const denom = Math.sqrt(magA) * Math.sqrt(magB);
//     return denom === 0 ? 0 : dot / denom;
// };

// const normalizeText = (text?: string) =>
//     (text || '')
//         .toLowerCase()
//         .replace(/[^\w\s]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();

// const tokenOverlapRatio = (a?: string, b?: string): number => {
//     const A = normalizeText(a).split(' ').filter(Boolean);
//     const B = normalizeText(b).split(' ').filter(Boolean);
//     if (!A.length || !B.length) return 0;
//     const setB = new Set(B);
//     const overlap = A.filter((t) => setB.has(t)).length;
//     return overlap / Math.min(A.length, B.length);
// };

// const calculateMatchScore = (
//     wantVec: number[] = [],
//     offerVec: number[] = [],
//     wantText: string = '',
//     offerText: string = ''
// ): number => {
//     const sim = cosineSimilarity(wantVec, offerVec);
//     const overlap = tokenOverlapRatio(wantText, offerText);
//     return 0.7 * sim + 0.3 * overlap;
// };

// // ----------------- Main Function -----------------
// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const MIN_SCORE = 0.4;
//     const MAX_CYCLE_SIZE = 5;

//     const isEmpty = (t?: string) => normalizeText(t) === 'empty';
//     const isSurprise = (t?: string) => normalizeText(t) === 'surprise';

//     // Helper: calculate score with surprise wildcard
//     const getMatchScoreWithSurprise = (
//         wantVec: number[],
//         offerVec: number[],
//         wantText: string,
//         offerText: string
//     ) => {
//         if (isSurprise(wantText) || isSurprise(offerText)) return 1;
//         return calculateMatchScore(wantVec, offerVec, wantText, offerText);
//     };

//     // 1️⃣ Fetch base bond request
//     const start = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//     })
//         .select('offer want offerVector wantVector location radius user')
//         .lean();

//     if (!start) throw new AppError(404, 'Bond request not found');

//     // 2️⃣ Ensure embeddings
//     if (!start.offerVector?.length) {
//         start.offerVector = await generateEmbedding(start.offer);
//         await BondRequest.updateOne(
//             { _id: start._id },
//             { offerVector: start.offerVector }
//         );
//     }
//     if (!start.wantVector?.length) {
//         start.wantVector = await generateEmbedding(start.want);
//         await BondRequest.updateOne(
//             { _id: start._id },
//             { wantVector: start.wantVector }
//         );
//     }

//     // 3️⃣ Geo filter (optional)
//     const geoFilter: any = {};
//     if (start.location && start.radius) {
//         const [lng, lat] = start.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: { $centerSphere: [[lng, lat], start.radius / 6371] },
//         };
//     }

//     // 4️⃣ Fetch candidates
//     const candidates = await BondRequest.find({
//         _id: { $ne: bondRequestId },
//         user: { $ne: userId },
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//         ...geoFilter,
//     })
//         .select('_id user offer want offerVector wantVector location radius')
//         .lean();

//     // 5️⃣ Ensure embeddings for all
//     for (const c of candidates) {
//         if (!c.offerVector?.length)
//             c.offerVector = await generateEmbedding(c.offer || '');
//         if (!c.wantVector?.length)
//             c.wantVector = await generateEmbedding(c.want || '');
//     }

//     const matches: { ids: string[]; score: number }[] = [];
//     const globalSeen = new Set<string>();

//     // 6️⃣ 2-Person Matches
//     for (const c of candidates) {
//         if (c.user.toString() === start.user.toString()) continue;

//         const skipEmpty =
//             (isEmpty(start.offer) && !isEmpty(c.want)) ||
//             (isEmpty(start.want) && !isEmpty(c.offer));
//         if (skipEmpty) continue;

//         const score1 = getMatchScoreWithSurprise(
//             start.wantVector,
//             c.offerVector,
//             start.want,
//             c.offer
//         );
//         const score2 = getMatchScoreWithSurprise(
//             c.wantVector,
//             start.offerVector,
//             c.want,
//             start.offer
//         );

//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             const avg = Math.min(1, (score1 + score2) / 2);
//             const key = [bondRequestId, c._id.toString()].sort().join('-');
//             if (!globalSeen.has(key)) {
//                 globalSeen.add(key);
//                 matches.push({
//                     ids: [bondRequestId, c._id.toString()],
//                     score: avg,
//                 });
//             }
//         }
//     }

//     // 7️⃣ Build adjacency list for cycles
//     const allReqs = [start, ...candidates];
//     const requestMap = new Map(allReqs.map((r) => [r._id.toString(), r]));
//     const edges = new Map<string, { to: string; score: number }[]>();

//     for (const [id, req] of requestMap) {
//         edges.set(id, []);
//         for (const [tid, tReq] of requestMap) {
//             if (id === tid) continue;
//             if (req.user.toString() === tReq.user.toString()) continue;

//             if (isEmpty(req.offer) && !isEmpty(tReq.want)) continue;
//             if (isEmpty(req.want) && !isEmpty(tReq.offer)) continue;

//             const score = getMatchScoreWithSurprise(
//                 req.wantVector,
//                 tReq.offerVector,
//                 req.want,
//                 tReq.offer
//             );

//             if (score >= MIN_SCORE) {
//                 edges.get(id)!.push({ to: tid, score });
//             }
//         }
//     }

//     // 8️⃣ DFS to find unique cycles (3–MAX_CYCLE_SIZE)
//     const seenCycles = new Set<string>();

//     const dfs = (
//         startId: string,
//         currId: string,
//         path: string[],
//         accScore: number,
//         userSet: Set<string>
//     ) => {
//         if (path.length > MAX_CYCLE_SIZE) return;

//         for (const { to, score } of edges.get(currId) || []) {
//             const nextReq = requestMap.get(to);
//             if (!nextReq) continue;

//             const nextUser = nextReq.user.toString();
//             if (userSet.has(nextUser)) continue;

//             if (path.includes(to)) {
//                 if (to === startId && path.length >= 3) {
//                     const key = path.sort().join('-');
//                     if (!seenCycles.has(key) && !globalSeen.has(key)) {
//                         seenCycles.add(key);
//                         globalSeen.add(key);
//                         matches.push({ ids: [...path], score: accScore });
//                     }
//                 }
//                 continue;
//             }

//             const newUserSet = new Set(userSet);
//             newUserSet.add(nextUser);
//             const newScore = (accScore + score) / 2;
//             dfs(startId, to, [...path, to], newScore, newUserSet);
//         }
//     };

//     dfs(
//         bondRequestId,
//         bondRequestId,
//         [bondRequestId],
//         1,
//         new Set([start.user.toString()])
//     );

//     // 9️⃣ Populate
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate('user', 'name profile_image')
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     // 🔟 Prepare result
//     const sorted = matches.sort((a, b) => b.score - a.score);
//     const total = sorted.length;
//     const startIndex = (page - 1) * limit;
//     const paginated = sorted.slice(startIndex, startIndex + limit);

//     const data = paginated.map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//     }));

//     return { total, page, limit, data };
// };

// ----------------- Helpers -----------------
const cosineSimilarity = (a: number[], b: number[]): number => {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    const len = Math.min(a.length, b.length);
    let dot = 0,
        magA = 0,
        magB = 0;
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        magA += a[i] ** 2;
        magB += b[i] ** 2;
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
};

const normalizeText = (text?: string) =>
    (text || '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const tokenOverlapRatio = (a?: string, b?: string): number => {
    const A = normalizeText(a).split(' ').filter(Boolean);
    const B = normalizeText(b).split(' ').filter(Boolean);
    if (!A.length || !B.length) return 0;
    const setB = new Set(B);
    const overlap = A.filter((t) => setB.has(t)).length;
    return overlap / Math.min(A.length, B.length);
};

const calculateMatchScore = (
    wantVec: number[] = [],
    offerVec: number[] = [],
    wantText: string = '',
    offerText: string = ''
): number => {
    const sim = cosineSimilarity(wantVec, offerVec);
    const overlap = tokenOverlapRatio(wantText, offerText);
    return 0.7 * sim + 0.3 * overlap;
};

// ----------------- Main Function -----------------
export const getMatchingBondRequest = async (
    userId: string,
    bondRequestId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const MIN_SCORE = 0.4;
    const MAX_CYCLE_SIZE = 5;

    const isEmpty = (t?: string) => normalizeText(t) === 'empty';
    const isSurprise = (t?: string) => normalizeText(t) === 'surprise';

    // Helper: wildcard surprise
    const getMatchScoreWithSurprise = (
        wantVec: number[],
        offerVec: number[],
        wantText: string,
        offerText: string
    ) => {
        if (isSurprise(wantText) || isSurprise(offerText)) return 1;
        return calculateMatchScore(wantVec, offerVec, wantText, offerText);
    };

    // 1️⃣ Fetch base bond request
    const start = await BondRequest.findOne({
        _id: bondRequestId,
        user: userId,
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
    })
        .select('offer want offerVector wantVector location radius user')
        .lean();

    if (!start) throw new AppError(404, 'Bond request not found');

    // 2️⃣ Ensure embeddings
    if (!start.offerVector?.length) {
        start.offerVector = await generateEmbedding(start.offer);
        await BondRequest.updateOne(
            { _id: start._id },
            { offerVector: start.offerVector }
        );
    }
    if (!start.wantVector?.length) {
        start.wantVector = await generateEmbedding(start.want);
        await BondRequest.updateOne(
            { _id: start._id },
            { wantVector: start.wantVector }
        );
    }

    // 3️⃣ Geo filter
    const geoFilter: any = {};
    if (start.location && start.radius) {
        const [lng, lat] = start.location.coordinates;
        geoFilter.location = {
            $geoWithin: { $centerSphere: [[lng, lat], start.radius / 6371] },
        };
    }

    // 4️⃣ Fetch candidates
    const candidates = await BondRequest.find({
        _id: { $ne: bondRequestId },
        user: { $ne: userId },
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
        ...geoFilter,
    })
        .select('_id user offer want offerVector wantVector location radius')
        .lean();

    // 5️⃣ Ensure embeddings for all
    for (const c of candidates) {
        if (!c.offerVector?.length)
            c.offerVector = await generateEmbedding(c.offer || '');
        if (!c.wantVector?.length)
            c.wantVector = await generateEmbedding(c.want || '');
    }

    const matches: { ids: string[]; score: number }[] = [];
    const globalSeen = new Set<string>();

    // 6️⃣ 2-person direct matches
    for (const c of candidates) {
        if (c.user.toString() === start.user.toString()) continue;

        // skip empty mismatch
        if (
            (isEmpty(start.offer) && !isEmpty(c.want)) ||
            (isEmpty(start.want) && !isEmpty(c.offer))
        )
            continue;

        // score using surprise wildcard
        const score1 = getMatchScoreWithSurprise(
            start.wantVector,
            c.offerVector,
            start.want,
            c.offer
        );
        const score2 = getMatchScoreWithSurprise(
            c.wantVector,
            start.offerVector,
            c.want,
            start.offer
        );

        if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
            const avg = Math.min(1, (score1 + score2) / 2);
            const key = [bondRequestId, c._id.toString()].sort().join('-');
            if (!globalSeen.has(key)) {
                globalSeen.add(key);
                matches.push({
                    ids: [bondRequestId, c._id.toString()],
                    score: avg,
                });
            }
        }
    }

    // 7️⃣ Build adjacency for cycles
    const allReqs = [start, ...candidates];
    const requestMap = new Map(allReqs.map((r) => [r._id.toString(), r]));
    const edges = new Map<string, { to: string; score: number }[]>();

    for (const [id, req] of requestMap) {
        edges.set(id, []);
        for (const [tid, tReq] of requestMap) {
            if (id === tid) continue;
            if (req.user.toString() === tReq.user.toString()) continue;
            if (isEmpty(req.offer) && !isEmpty(tReq.want)) continue;
            if (isEmpty(req.want) && !isEmpty(tReq.offer)) continue;

            const score = getMatchScoreWithSurprise(
                req.wantVector,
                tReq.offerVector,
                req.want,
                tReq.offer
            );
            if (score >= MIN_SCORE) edges.get(id)!.push({ to: tid, score });
        }
    }

    // 8️⃣ DFS for cycles (unique users only)
    const seenCycles = new Set<string>();
    const dfs = (
        startId: string,
        currId: string,
        path: string[],
        accScore: number,
        userSet: Set<string>
    ) => {
        if (path.length > MAX_CYCLE_SIZE) return;

        for (const { to, score } of edges.get(currId) || []) {
            const nextReq = requestMap.get(to);
            if (!nextReq) continue;

            const nextUser = nextReq.user.toString();
            if (userSet.has(nextUser)) continue; // user already used

            if (path.includes(to)) {
                if (to === startId && path.length >= 3) {
                    const key = path.sort().join('-');
                    if (!seenCycles.has(key) && !globalSeen.has(key)) {
                        seenCycles.add(key);
                        globalSeen.add(key);
                        matches.push({ ids: [...path], score: accScore });
                    }
                }
                continue;
            }

            const newUserSet = new Set(userSet);
            newUserSet.add(nextUser);
            const newScore = (accScore + score) / 2;
            dfs(startId, to, [...path, to], newScore, newUserSet);
        }
    };

    dfs(
        bondRequestId,
        bondRequestId,
        [bondRequestId],
        1,
        new Set([start.user.toString()])
    );

    // 9️⃣ Populate
    const allIds = [...new Set(matches.flatMap((m) => m.ids))];
    const populated = await BondRequest.find({ _id: { $in: allIds } })
        .select('-wantVector -offerVector')
        .populate('user', 'name profile_image')
        .lean();

    const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

    // 🔟 Prepare final result
    const sorted = matches.sort((a, b) => b.score - a.score);
    const total = sorted.length;
    const startIndex = (page - 1) * limit;
    const paginated = sorted.slice(startIndex, startIndex + limit);

    const data = paginated.map((m) => ({
        matchRequest: m.ids.map((id) => populatedMap.get(id)),
        matchScore: Number(m.score.toFixed(3)),
    }));

    return { total, page, limit, data };
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
