/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { isTextSafe } from '../../helper/isTextSafe';
import { generateEmbedding } from '../../utilities/embedding';
import NormalUser from '../normalUser/normalUser.model';
import { ENUM_BOND_REQUEST_STATUS } from './bondRequest.enum';
import { IBondRequest } from './bondRequest.interface';
import BondRequest from './bondRequest.model';

const createBondRequestIntoDB = async (
    userId: string,
    payload: IBondRequest
) => {
    const [user, currentBondCount] = await Promise.all([
        NormalUser.findById(userId),
        BondRequest.countDocuments({ user: userId }),
    ]);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (currentBondCount >= user.bondLimit) {
        throw new AppError(
            httpStatus.NOT_ACCEPTABLE,
            'Bond request limit reached. Please upgrade your subscription.'
        );
    }

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

const getLastBond = async (userId: string) => {
    return await BondRequest.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select('offer want location');
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
        BondRequest.find({ user: userId, isLinked: false }).select(
            '-offerVector -wantVector'
        ),
        query
    )
        .search(['offer', 'want', 'location'])
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

/// last try man ------------------------------

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
//     offerVec: number[] = []
// ): number => {
//     // Rely 100% on the AI Cosine Similarity
//     const sim = cosineSimilarity(wantVec, offerVec);

//     // Optional: You can still use overlap as a small "bonus"
//     // but don't let it penalize the score if it's 0.
//     return sim;
// };

// // --- Helper for "surprise" scoring ---
// const calculateMatchScoreWithSurprise = (
//     want: string,
//     wantVec: number[],
//     offer: string,
//     offerVec: number[]
// ): number => {
//     const isSurprise = (s?: string) => normalizeText(s) === 'surprise';
//     if (isSurprise(want)) {
//         // Want = surprise → accept anything, give minimum high score
//         // return 0.8 + 0.2 * calculateMatchScore(wantVec, offerVec, want, offer);
//         return 0.8 + 0.2 * calculateMatchScore(wantVec, offerVec);
//     }
//     // return calculateMatchScore(wantVec, offerVec, want, offer);
//     return calculateMatchScore(wantVec, offerVec);
// };

// export const isHighConfidenceMatch = (score: number) => score >= 0.7;

// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const minScore = 0.4;
//     const maxCycleSize = 5;
//     const MIN_SCORE = Number(minScore);

//     const isEmpty = (s?: string) => normalizeText(s) === 'empty';
//     const isSurprise = (s?: string) => normalizeText(s) === 'surprise';

//     const isValidMatch = (want: string, offer: string): boolean => {
//         const wantSurprise = isSurprise(want);
//         const offerSurprise = isSurprise(offer);
//         if (wantSurprise) return true;
//         if (offerSurprise) return wantSurprise;

//         // Remove the tokenOverlap check entirely,
//         // or set a very low threshold.
//         return true;
//     };

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

//     // 2. Geo filter
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 3. Fetch candidates
//     const candidates = await BondRequest.aggregate([
//         {
//             $match: {
//                 _id: { $ne: new mongoose.Types.ObjectId(bondRequestId) },
//                 user: { $ne: new mongoose.Types.ObjectId(userId) },
//                 status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//                 isPause: false,
//                 ...geoFilter,
//             },
//         },
//         { $sample: { size: 150 } },
//         {
//             $project: {
//                 _id: 1,
//                 user: 1,
//                 offer: 1,
//                 want: 1,
//                 offerVector: 1,
//                 wantVector: 1,
//                 location: 1,
//                 radius: 1,
//             },
//         },
//     ]);

//     const matches: { ids: string[]; score: number }[] = [];
//     const globalSeen = new Set<string>();

//     // 4. Pairwise matches
//     for (const candidate of candidates) {
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

//         if (!isValidMatch(startRequest.want, candidate.offer)) continue;
//         if (!isValidMatch(candidate.want, startRequest.offer)) continue;

//         const score1 = calculateMatchScoreWithSurprise(
//             startRequest.want,
//             startRequest.wantVector || [],
//             candidate.offer,
//             candidate.offerVector || []
//         );
//         const score2 = calculateMatchScoreWithSurprise(
//             candidate.want,
//             candidate.wantVector || [],
//             startRequest.offer,
//             startRequest.offerVector || []
//         );

//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             const avgScore = (score1 + score2) / 2;
//             const pairKey = [bondRequestId, candidate._id.toString()]
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

//     // 5. Build edges for cycles
//     const requestMap = new Map<string, any>(
//         candidates.map((c) => [c._id.toString(), c])
//     );
//     requestMap.set(bondRequestId, startRequest);

//     const edges: Map<string, { to: string; score: number }[]> = new Map();
//     for (const [id, req] of requestMap.entries()) {
//         edges.set(id, []);
//         for (const [toId, toReq] of requestMap.entries()) {
//             if (id === toId) continue;
//             if (!isValidMatch(req.want, toReq.offer)) continue;
//             if (!isValidMatch(toReq.want, req.offer)) continue;

//             const score = calculateMatchScoreWithSurprise(
//                 req.want,
//                 req.wantVector || [],
//                 toReq.offer,
//                 toReq.offerVector || []
//             );

//             if (score >= MIN_SCORE) {
//                 edges.get(id)!.push({ to: toId, score });
//             }
//         }
//     }

//     // 6. DFS to find cycles
//     const seenCycles = new Set<string>();
//     const dfs = (
//         startId: string,
//         currentId: string,
//         path: string[],
//         accScore: number
//     ) => {
//         if (path.length > maxCycleSize) return;

//         const usersInPath = new Set(
//             path.map(
//                 (id) =>
//                     requestMap.get(id)?.user?.toString() ||
//                     requestMap.get(id)?.user?._id?.toString()
//             )
//         );

//         for (const { to, score: nextScore } of edges.get(currentId) || []) {
//             if (path.includes(to)) {
//                 if (to === startId && path.length >= 3) {
//                     const hash = path.join('-');
//                     if (!seenCycles.has(hash)) {
//                         seenCycles.add(hash);
//                         const cycleKey = hash;
//                         if (!globalSeen.has(cycleKey)) {
//                             globalSeen.add(cycleKey);
//                             matches.push({ ids: [...path], score: accScore });
//                         }
//                     }
//                 }
//                 continue;
//             }

//             const toRequest = requestMap.get(to);
//             const toUserId =
//                 toRequest?.user?.toString() || toRequest?.user?._id?.toString();
//             if (usersInPath.has(toUserId)) continue;

//             const newScore = (accScore + nextScore) / 2;
//             dfs(startId, to, [...path, to], newScore);
//         }
//     };

//     dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

//     // 7. Populate final results
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     const sorted = matches.sort((a, b) => b.score - a.score);
//     const total = sorted.length;
//     const startIndex = (page - 1) * limit;
//     const paginated = sorted.slice(startIndex, startIndex + limit);

//     const result = paginated.map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//     }));
//     const cappedTotal = Math.min(total, 100);

//     return {
//         total: cappedTotal,
//         page,
//         limit,
//         data: result,
//     };
// };

//explore more thing

export const cosineSimilarity = (a: number[], b: number[]): number => {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    const minLen = Math.min(a.length, b.length);
    let dot = 0,
        magA = 0,
        magB = 0;
    for (let i = 0; i < minLen; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (!magA || !magB) return 0;
    return dot / (magA * magB);
};

export const normalizeText = (s?: string) =>
    (s || '')
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export const tokenOverlapRatio = (a?: string, b?: string): number => {
    const A = normalizeText(a).split(' ').filter(Boolean);
    const B = normalizeText(b).split(' ').filter(Boolean);
    if (!A.length || !B.length) return 0;
    const setB = new Set(B);
    const overlap = A.filter((t) => setB.has(t)).length;
    return overlap / Math.min(A.length, B.length);
};

export const calculateMatchScore = (
    wantVec: number[] = [],
    offerVec: number[] = []
): number => {
    // Rely 100% on the AI Cosine Similarity
    const sim = cosineSimilarity(wantVec, offerVec);

    // Optional: You can still use overlap as a small "bonus"
    // but don't let it penalize the score if it's 0.
    return sim;
};

// --- Helper for "surprise" scoring ---
const calculateMatchScoreWithSurprise = (
    want: string,
    wantVec: number[],
    offer: string,
    offerVec: number[]
): number => {
    const isSurprise = (s?: string) => normalizeText(s) === 'surprise';
    if (isSurprise(want)) {
        // Want = surprise → accept anything, give minimum high score
        // return 0.8 + 0.2 * calculateMatchScore(wantVec, offerVec, want, offer);
        return 0.8 + 0.2 * calculateMatchScore(wantVec, offerVec);
    }
    // return calculateMatchScore(wantVec, offerVec, want, offer);
    return calculateMatchScore(wantVec, offerVec);
};

export const isHighConfidenceMatch = (score: number) => score >= 0.7;
// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const MIN_SCORE = 0.4;
//     const maxCycleSize = 5;

//     const isEmpty = (s?: string) => normalizeText(s) === 'empty';
//     const isSurprise = (s?: string) => normalizeText(s) === 'surprise';

//     const matchType = (want: string, offer: string) =>
//         isSurprise(want) || isSurprise(offer) ? 'surprise' : 'entry';

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const isValidMatch = (want: string, offer: string) => true;

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

//     // 2. Geo filter
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 3. Fetch candidates
//     const candidates = await BondRequest.aggregate([
//         {
//             $match: {
//                 _id: { $ne: new mongoose.Types.ObjectId(bondRequestId) },
//                 user: { $ne: new mongoose.Types.ObjectId(userId) },
//                 status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//                 isPause: false,
//                 ...geoFilter,
//             },
//         },
//         { $sample: { size: 150 } },
//         {
//             $project: {
//                 _id: 1,
//                 user: 1,
//                 offer: 1,
//                 want: 1,
//                 offerVector: 1,
//                 wantVector: 1,
//                 location: 1,
//                 radius: 1,
//             },
//         },
//     ]);

//     const matches: {
//         ids: string[];
//         score: number;
//         type: 'entry' | 'surprise';
//     }[] = [];
//     const globalSeen = new Set<string>();

//     // 4. Pairwise matches (2-person matches)
//     for (const candidate of candidates) {
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

//         if (!isValidMatch(startRequest.want, candidate.offer)) continue;
//         if (!isValidMatch(candidate.want, startRequest.offer)) continue;

//         const score1 = calculateMatchScoreWithSurprise(
//             startRequest.want,
//             startRequest.wantVector || [],
//             candidate.offer,
//             candidate.offerVector || []
//         );
//         const score2 = calculateMatchScoreWithSurprise(
//             candidate.want,
//             candidate.wantVector || [],
//             startRequest.offer,
//             startRequest.offerVector || []
//         );

//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             const avgScore = (score1 + score2) / 2;
//             const pairKey = [bondRequestId, candidate._id.toString()]
//                 .sort()
//                 .join('-');
//             if (!globalSeen.has(pairKey)) {
//                 globalSeen.add(pairKey);
//                 matches.push({
//                     ids: [bondRequestId, candidate._id.toString()],
//                     score: avgScore,
//                     type: matchType(startRequest.want, candidate.offer),
//                 });
//             }
//         }
//     }

//     // 5. Build edges for cycles (3–5 people)
//     const requestMap = new Map<string, any>(
//         candidates.map((c) => [c._id.toString(), c])
//     );
//     requestMap.set(bondRequestId, startRequest);

//     const edges: Map<string, { to: string; score: number }[]> = new Map();
//     for (const [id, req] of requestMap.entries()) {
//         edges.set(id, []);
//         for (const [toId, toReq] of requestMap.entries()) {
//             if (id === toId) continue;
//             if (!isValidMatch(req.want, toReq.offer)) continue;
//             if (!isValidMatch(toReq.want, req.offer)) continue;

//             const score = calculateMatchScoreWithSurprise(
//                 req.want,
//                 req.wantVector || [],
//                 toReq.offer,
//                 toReq.offerVector || []
//             );

//             if (score >= MIN_SCORE) {
//                 edges.get(id)!.push({ to: toId, score });
//             }
//         }
//     }

//     // 6. DFS to find cycles
//     const seenCycles = new Set<string>();
//     const dfs = (
//         startId: string,
//         currentId: string,
//         path: string[],
//         accScore: number
//     ) => {
//         if (path.length > maxCycleSize) return;

//         const usersInPath = new Set(
//             path.map(
//                 (id) =>
//                     requestMap.get(id)?.user?.toString() ||
//                     requestMap.get(id)?.user?._id?.toString()
//             )
//         );

//         for (const { to, score: nextScore } of edges.get(currentId) || []) {
//             if (path.includes(to)) {
//                 if (to === startId && path.length >= 3) {
//                     const hash = path.join('-');
//                     if (!seenCycles.has(hash)) {
//                         seenCycles.add(hash);
//                         const cycleType = path.some(
//                             (id) =>
//                                 isSurprise(requestMap.get(id)?.want) ||
//                                 isSurprise(requestMap.get(id)?.offer)
//                         )
//                             ? 'surprise'
//                             : 'entry';
//                         if (!globalSeen.has(hash)) {
//                             globalSeen.add(hash);
//                             matches.push({
//                                 ids: [...path],
//                                 score: accScore,
//                                 type: cycleType,
//                             });
//                         }
//                     }
//                 }
//                 continue;
//             }

//             const toRequest = requestMap.get(to);
//             const toUserId =
//                 toRequest?.user?.toString() || toRequest?.user?._id?.toString();
//             if (usersInPath.has(toUserId)) continue;

//             const newScore = (accScore + nextScore) / 2; // running average
//             dfs(startId, to, [...path, to], newScore);
//         }
//     };

//     dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

//     // 7. Populate final results
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];
//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     // 8. Sort matches based on client requirement
//     matches.sort((a, b) => {
//         // 1️⃣ Number of people
//         if (a.ids.length !== b.ids.length) return a.ids.length - b.ids.length;

//         // 2️⃣ Type: entry first, surprise next
//         if (a.type !== b.type) return a.type === 'entry' ? -1 : 1;

//         // 3️⃣ Score descending
//         return b.score - a.score;
//     });

//     const total = matches.length;
//     const startIndex = (page - 1) * limit;
//     const paginated = matches.slice(startIndex, startIndex + limit);

//     const result = paginated.map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//         type: m.type,
//     }));

//     return {
//         total: Math.min(total, 100),
//         page,
//         limit,
//         data: result,
//     };
// };

// type MatchType = 'entry' | 'surprise' | 'empty';

// export const getMatchingBondRequest = async (
//     userId: string,
//     bondRequestId: string,
//     query: Record<string, unknown>
// ) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const MIN_SCORE = 0.4;
//     const maxCycleSize = 5;

//     const normalize = (s?: string) => normalizeText(s);
//     const isEmpty = (s?: string) => normalize(s) === 'empty';

//     // ✅ ENTRY > SURPRISE > EMPTY (candidate-only)
//     const getPairMatchType = (candidate: any): MatchType => {
//         const want = normalize(candidate.want);
//         const offer = normalize(candidate.offer);

//         if (want === 'empty' || offer === 'empty') return 'empty';
//         if (want === 'surprise' || offer === 'surprise') return 'surprise';
//         return 'entry';
//     };

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const isValidMatch = (want: string, offer: string) => true;

//     // 1️⃣ Fetch start request
//     const startRequest = await BondRequest.findOne({
//         _id: bondRequestId,
//         user: userId,
//         status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//         isPause: false,
//     })
//         .select('offer want offerVector wantVector location radius user')
//         .lean();

//     if (!startRequest) throw new AppError(404, 'Bond request not found');

//     // 2️⃣ Geo filter
//     const geoFilter: any = {};
//     if (startRequest.location && startRequest.radius) {
//         const [lng, lat] = startRequest.location.coordinates;
//         geoFilter.location = {
//             $geoWithin: {
//                 $centerSphere: [[lng, lat], startRequest.radius / 6371],
//             },
//         };
//     }

//     // 3️⃣ Fetch candidates
//     const candidates = await BondRequest.aggregate([
//         {
//             $match: {
//                 _id: { $ne: new mongoose.Types.ObjectId(bondRequestId) },
//                 user: { $ne: new mongoose.Types.ObjectId(userId) },
//                 status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
//                 isPause: false,
//                 ...geoFilter,
//             },
//         },
//         { $sample: { size: 150 } },
//         {
//             $project: {
//                 _id: 1,
//                 user: 1,
//                 offer: 1,
//                 want: 1,
//                 offerVector: 1,
//                 wantVector: 1,
//             },
//         },
//     ]);

//     const matches: {
//         ids: string[];
//         score: number;
//         type: MatchType;
//     }[] = [];

//     const globalSeen = new Set<string>();

//     // 4️⃣ Pairwise (2-person) matches
//     for (const candidate of candidates) {
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

//         if (!isValidMatch(startRequest.want, candidate.offer)) continue;
//         if (!isValidMatch(candidate.want, startRequest.offer)) continue;

//         const score1 = calculateMatchScoreWithSurprise(
//             startRequest.want,
//             startRequest.wantVector || [],
//             candidate.offer,
//             candidate.offerVector || []
//         );

//         const score2 = calculateMatchScoreWithSurprise(
//             candidate.want,
//             candidate.wantVector || [],
//             startRequest.offer,
//             startRequest.offerVector || []
//         );

//         if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
//             const avgScore = (score1 + score2) / 2;
//             const key = [bondRequestId, candidate._id.toString()]
//                 .sort()
//                 .join('-');

//             if (!globalSeen.has(key)) {
//                 globalSeen.add(key);
//                 matches.push({
//                     ids: [bondRequestId, candidate._id.toString()],
//                     score: avgScore,
//                     type: getPairMatchType(candidate),
//                 });
//             }
//         }
//     }

//     // 5️⃣ Build graph for cycles
//     const requestMap = new Map<string, any>(
//         candidates.map((c) => [c._id.toString(), c])
//     );
//     requestMap.set(bondRequestId, startRequest);

//     const edges = new Map<string, { to: string; score: number }[]>();

//     for (const [id, req] of requestMap.entries()) {
//         edges.set(id, []);
//         for (const [toId, toReq] of requestMap.entries()) {
//             if (id === toId) continue;
//             if (!isValidMatch(req.want, toReq.offer)) continue;

//             const score = calculateMatchScoreWithSurprise(
//                 req.want,
//                 req.wantVector || [],
//                 toReq.offer,
//                 toReq.offerVector || []
//             );

//             if (score >= MIN_SCORE) {
//                 edges.get(id)!.push({ to: toId, score });
//             }
//         }
//     }

//     // 6️⃣ Cycle type resolver (ignore start request)
//     const getCycleMatchType = (path: string[]): MatchType => {
//         let hasSurprise = false;

//         for (const id of path) {
//             if (id === bondRequestId) continue;

//             const req = requestMap.get(id);
//             const want = normalize(req?.want);
//             const offer = normalize(req?.offer);

//             if (want === 'empty' || offer === 'empty') return 'empty';
//             if (want === 'surprise' || offer === 'surprise') hasSurprise = true;
//         }

//         return hasSurprise ? 'surprise' : 'entry';
//     };

//     // 7️⃣ DFS for cycles (3–5)
//     const seenCycles = new Set<string>();

//     const dfs = (
//         startId: string,
//         currentId: string,
//         path: string[],
//         accScore: number
//     ) => {
//         if (path.length > maxCycleSize) return;

//         const usersInPath = new Set(
//             path.map(
//                 (id) =>
//                     requestMap.get(id)?.user?.toString() ||
//                     requestMap.get(id)?.user?._id?.toString()
//             )
//         );

//         for (const { to, score } of edges.get(currentId) || []) {
//             if (path.includes(to)) {
//                 if (to === startId && path.length >= 3) {
//                     const hash = path.join('-');
//                     if (seenCycles.has(hash)) continue;
//                     seenCycles.add(hash);

//                     if (!globalSeen.has(hash)) {
//                         globalSeen.add(hash);
//                         matches.push({
//                             ids: [...path],
//                             score: accScore,
//                             type: getCycleMatchType(path),
//                         });
//                     }
//                 }
//                 continue;
//             }

//             const nextReq = requestMap.get(to);
//             const nextUser =
//                 nextReq?.user?.toString() || nextReq?.user?._id?.toString();

//             if (usersInPath.has(nextUser)) continue;

//             dfs(startId, to, [...path, to], (accScore + score) / 2);
//         }
//     };

//     dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

//     // 8️⃣ Populate results
//     const allIds = [...new Set(matches.flatMap((m) => m.ids))];

//     const populated = await BondRequest.find({ _id: { $in: allIds } })
//         .select('-wantVector -offerVector')
//         .populate({ path: 'user', select: 'name profile_image' })
//         .lean();

//     const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

//     // 9️⃣ SORT: size → type → score
//     const typePriority: Record<MatchType, number> = {
//         entry: 1,
//         surprise: 2,
//         empty: 3,
//     };

//     matches.sort((a, b) => {
//         if (a.ids.length !== b.ids.length) {
//             return a.ids.length - b.ids.length;
//         }
//         if (a.type !== b.type) {
//             return typePriority[a.type] - typePriority[b.type];
//         }
//         return b.score - a.score;
//     });

//     const startIndex = (page - 1) * limit;

//     const result = matches.slice(startIndex, startIndex + limit).map((m) => ({
//         matchRequest: m.ids.map((id) => populatedMap.get(id)),
//         matchScore: Number(m.score.toFixed(3)),
//         type: m.type,
//     }));

//     return {
//         total: Math.min(matches.length, 100),
//         page,
//         limit,
//         data: result,
//     };
// };

type MatchType = 'entry' | 'surprise' | 'empty';

export const getMatchingBondRequest = async (
    userId: string,
    bondRequestId: string,
    query: Record<string, unknown>
) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const MIN_SCORE = 0.4;
    const maxCycleSize = 5;

    const normalize = (s?: string) => normalizeText(s);
    const isEmpty = (s?: string) => normalize(s) === 'empty';

    // Determine match type for a pair
    const getPairMatchType = (candidate: any): MatchType => {
        const want = normalize(candidate.want);
        const offer = normalize(candidate.offer);

        if (want === 'empty' || offer === 'empty') return 'empty';
        if (want === 'surprise' || offer === 'surprise') return 'surprise';
        return 'entry';
    };

    // Simple validity check (can be extended)
    const isValidMatch = (want: string, offer: string) => true;

    // 1️⃣ Fetch start request
    const startRequest = await BondRequest.findOne({
        _id: bondRequestId,
        user: userId,
        status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
        isPause: false,
    })
        .select('offer want offerVector wantVector location radius user')
        .lean();

    if (!startRequest) throw new AppError(404, 'Bond request not found');

    // 2️⃣ Geo filter
    const geoFilter: any = {};
    if (startRequest.location && startRequest.radius) {
        const [lng, lat] = startRequest.location.coordinates;
        geoFilter.location = {
            $geoWithin: {
                $centerSphere: [[lng, lat], startRequest.radius / 6371],
            },
        };
    }

    // 3️⃣ Fetch candidates
    const candidates = await BondRequest.aggregate([
        {
            $match: {
                _id: { $ne: new mongoose.Types.ObjectId(bondRequestId) },
                user: { $ne: new mongoose.Types.ObjectId(userId) },
                status: ENUM_BOND_REQUEST_STATUS.WAITING_FOR_LINK,
                isPause: false,
                ...geoFilter,
            },
        },
        { $sample: { size: 150 } },
        {
            $project: {
                _id: 1,
                user: 1,
                offer: 1,
                want: 1,
                offerVector: 1,
                wantVector: 1,
            },
        },
    ]);

    const matches: {
        ids: string[];
        score: number;
        type: MatchType;
    }[] = [];
    const globalSeen = new Set<string>();

    // 4️⃣ Pairwise 2-person matches
    for (const candidate of candidates) {
        const startOfferEmpty = isEmpty(startRequest.offer);
        const startWantEmpty = isEmpty(startRequest.want);
        const candidateOfferEmpty = isEmpty(candidate.offer);
        const candidateWantEmpty = isEmpty(candidate.want);

        if (
            (startOfferEmpty && !candidateWantEmpty) ||
            (startWantEmpty && !candidateOfferEmpty)
        ) {
            continue;
        }

        if (!isValidMatch(startRequest.want, candidate.offer)) continue;
        if (!isValidMatch(candidate.want, startRequest.offer)) continue;

        const score1 = calculateMatchScoreWithSurprise(
            startRequest.want,
            startRequest.wantVector || [],
            candidate.offer,
            candidate.offerVector || []
        );

        const score2 = calculateMatchScoreWithSurprise(
            candidate.want,
            candidate.wantVector || [],
            startRequest.offer,
            startRequest.offerVector || []
        );

        if (score1 >= MIN_SCORE && score2 >= MIN_SCORE) {
            const avgScore = (score1 + score2) / 2;
            const key = [bondRequestId, candidate._id.toString()]
                .sort()
                .join('-');

            if (!globalSeen.has(key)) {
                globalSeen.add(key);
                matches.push({
                    ids: [bondRequestId, candidate._id.toString()],
                    score: avgScore,
                    type: getPairMatchType(candidate),
                });
            }
        }
    }

    // 5️⃣ Build graph for cycles
    const requestMap = new Map<string, any>(
        candidates.map((c) => [c._id.toString(), c])
    );
    requestMap.set(bondRequestId, startRequest);

    const edges = new Map<string, { to: string; score: number }[]>();
    for (const [id, req] of requestMap.entries()) {
        edges.set(id, []);
        for (const [toId, toReq] of requestMap.entries()) {
            if (id === toId) continue;
            if (!isValidMatch(req.want, toReq.offer)) continue;

            const score = calculateMatchScoreWithSurprise(
                req.want,
                req.wantVector || [],
                toReq.offer,
                toReq.offerVector || []
            );

            if (score >= MIN_SCORE) {
                edges.get(id)!.push({ to: toId, score });
            }
        }
    }

    // 6️⃣ Cycle match type
    const getCycleMatchType = (path: string[]): MatchType => {
        let hasSurprise = false;
        for (const id of path) {
            if (id === bondRequestId) continue;
            const req = requestMap.get(id);
            const want = normalize(req?.want);
            const offer = normalize(req?.offer);
            if (want === 'empty' || offer === 'empty') return 'empty';
            if (want === 'surprise' || offer === 'surprise') hasSurprise = true;
        }
        return hasSurprise ? 'surprise' : 'entry';
    };

    // 7️⃣ DFS to find cycles
    const seenCycles = new Set<string>();
    const dfs = (
        startId: string,
        currentId: string,
        path: string[],
        accScore: number
    ) => {
        if (path.length > maxCycleSize) return;

        const usersInPath = new Set(
            path.map(
                (id) =>
                    requestMap.get(id)?.user?.toString() ||
                    requestMap.get(id)?.user?._id?.toString()
            )
        );

        for (const { to, score } of edges.get(currentId) || []) {
            if (path.includes(to)) {
                if (to === startId && path.length >= 3) {
                    const hash = path.join('-');
                    if (seenCycles.has(hash)) continue;
                    seenCycles.add(hash);

                    if (!globalSeen.has(hash)) {
                        globalSeen.add(hash);
                        matches.push({
                            ids: [...path],
                            score: accScore,
                            type: getCycleMatchType(path),
                        });
                    }
                }
                continue;
            }

            const nextReq = requestMap.get(to);
            const nextUser =
                nextReq?.user?.toString() || nextReq?.user?._id?.toString();
            if (usersInPath.has(nextUser)) continue;

            dfs(startId, to, [...path, to], (accScore + score) / 2);
        }
    };

    dfs(bondRequestId, bondRequestId, [bondRequestId], 1);

    // 8️⃣ Populate requests
    const allIds = [...new Set(matches.flatMap((m) => m.ids))];
    const populated = await BondRequest.find({ _id: { $in: allIds } })
        .select('-wantVector -offerVector')
        .populate({ path: 'user', select: 'name profile_image' })
        .lean();

    const populatedMap = new Map(populated.map((r) => [r._id.toString(), r]));

    // 9️⃣ Sorting matches
    const typePriority: Record<MatchType, number> = {
        entry: 1,
        surprise: 2,
        empty: 3,
    };

    matches.sort((a, b) => {
        if (a.ids.length !== b.ids.length) return a.ids.length - b.ids.length;
        if (a.type !== b.type)
            return typePriority[a.type] - typePriority[b.type];
        return b.score - a.score;
    });

    const startIndex = (page - 1) * limit;

    // 10️⃣ Assign offer↔want pair colors
    const generateColorFromPair = (offer: string, want: string) => {
        let hash = 0;
        const str = offer + '-' + want;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    const assignPairColors = (chain: any[]) => {
        const n = chain.length;
        for (let i = 0; i < n; i++) {
            const current = chain[i];
            const next = chain[(i + 1) % n]; // cycle connection
            const color = generateColorFromPair(current.offer, next.want);

            // assign to the matched pair
            current.offerColor = color;
            next.wantColor = color;
        }
        return chain;
    };

    // 11️⃣ Build final result with pair colors
    const result = matches.slice(startIndex, startIndex + limit).map((m) => {
        const chain = m.ids.map((id) => populatedMap.get(id));
        const coloredChain = assignPairColors(chain);
        return {
            matchRequest: coloredChain,
            matchScore: Number(m.score.toFixed(3)),
            type: m.type,
        };
    });

    return {
        total: Math.min(matches.length, 100),
        page,
        limit,
        data: result,
    };
};

const bondRequestService = {
    createBondRequestIntoDB,
    getAllBondRequests,
    getSingleBondRequest,
    updateBondRequestIntoDB,
    deleteBondRequestFromDB,
    myBondRequests,
    getMatchingBondRequest,
    getLastBond,
};

export default bondRequestService;
